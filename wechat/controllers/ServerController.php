<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/15
 * Time: 15:45
 * 微信自动回复累
 */

namespace wechat\controllers;


class ServerController extends BaseController {

    /**
     * 微信服务器推送事件
     */
    public function actionEvent() {

        if ( ! isset( $_GET['echostr'] ) ) {
            // 关注
            $this->responseMsg();
        } else {
            // 验证服务器
            $this->validate();
        }
    }

    private function validate() {
        $echoStr = $_GET["echostr"];
        echo $echoStr;
    }

    private function responseMsg() {
        $postStr = $GLOBALS["HTTP_RAW_POST_DATA"];
        file_put_contents('./log.txt' , $postStr."\n" ,FILE_APPEND);
        if ( ! empty( $postStr ) ) {
            libxml_disable_entity_loader( true );
            $postObj      = simplexml_load_string( $postStr , 'SimpleXMLElement' , LIBXML_NOCDATA );
            $fromUsername = $postObj->FromUserName;
            $fromUsername = trim($fromUsername);
            $toUsername   = $postObj->ToUserName;

            $resultStr = \Yii::$app->wechat->responseNews($fromUsername , $toUsername);

            $userInfo = \Yii::$app->wechat->getMemberInfo($fromUsername);
            if(is_array($userInfo) && count($userInfo) > 0){
                file_put_contents('./log.txt' , $fromUsername."\n" ,FILE_APPEND);
            }else{
                file_put_contents('./log.txt' ,"chuxiancuowu\n" ,FILE_APPEND);
            }
            echo $resultStr;
            file_put_contents('./log.txt' , $resultStr."\n" ,FILE_APPEND);
            \Yii::$app->wechat->sendMaterial($fromUsername , "TtSb9HO50njLDfRLrBEM_NKXrzVpIgfX9DYtwftdrGQ");

            exit;
        } else {
            echo "";
            exit;
        }
    }

    public function actionMaterial(){
        $result_1 = \Yii::$app->wechat->deleteMenu();

        $appId = \Yii::$app->wechat->appId;

        $url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid={$appId}&redirect_uri=http://wechat.baihey.com/wap/chat/list&response_type=code&scope=snsapi_base&state=ad#wechat_redirect";
        $result = \Yii::$app->wechat->createMenu(
//            [
//                'type' => 'click',
//                'name' => '嘉瑞百合缘',
//                'key' => 'V1001_TODAY_MUSIC'
//            ],
            [
                'type' => 'view',
                'name' => '嘉瑞登录',
                'url' => $url
            ]
        );


        var_dump(\Yii::$app->wechat->getMenuList());

        var_dump($result_1);

        var_dump($result);
    }

}