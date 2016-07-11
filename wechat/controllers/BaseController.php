<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/10
 * Time: 10:16
 */

namespace wechat\controllers;


use common\util\Cookie;
use wechat\models\User;
use yii\web\Controller;

class BaseController extends Controller {

    public $enableCsrfValidation = false;

    protected $assign = [ ];

    protected $get;
    protected $post;
    public $title;

    public function init() {
        $this->get   = \Yii::$app->request->get();
        $this->post  = \Yii::$app->request->post();
        $this->title = '嘉瑞百合缘';
        parent::init();
    }

    /**
     * 判断是否登录
     * @return bool
     */
    public function isLogin() {

        if ( Cookie::getInstance()->getCookie( 'bhy_u_name' ) ) {
            return true;
        }

        return false;
    }

    /**
     * 成功跳转
     *
     * @param $message
     * @param string $url
     *
     * @return \yii\web\Response
     */
    public function __success( $message , $url = "" ) {
        setcookie( "alert_message" , json_encode( [ 'status' => 1 , 'message' => $message ] ) );
        if ( $url == "" ) {
            $url = $_SERVER['HTTP_REFERER'];
        }

        return $this->redirect( $url );
    }

    public function __error( $message , $url = "" ) {
        setcookie( "alert_message" , json_encode( [ 'status' => 0 , 'message' => $message ] ) );
        if ( $url == "" ) {
            $url = $_SERVER['HTTP_REFERER'];
        }

        return $this->redirect( $url );
    }


    public function render( $params = [ ] , $view = '' ) {

        if ( $view == '' ) {
            $view = \Yii::$app->controller->action->id;
        }
        $view = $view . ".html";
        $arr  = array_merge( $params , $this->assign );

        return parent::render( $view , $arr );
    }

    public function renderAjax( $params = [ ] , $view = '' ) {

        if ( $view == '' ) {
            $view = \Yii::$app->controller->action->id;
        }
        $view = $view . ".html";
        $arr  = array_merge( $params , $this->assign );
        echo json_encode( $arr );

    }

    public function assign( $field , $value ) {

        $this->assign[ $field ] = $value;
    }

    /**
     * 404页面
     */
    public function actionError() {

        $view = "/" . \Yii::$app->request->pathInfo;

        return $this->render( [ ] , $view );
    }

    /**
     * 微信登录获取微信用户信息
     * @return array|bool
     */
    protected function weChatMember() {
        $code = \Yii::$app->request->get( 'code' );
        if ( $code == null ) {
            return false;
        }
        $memberInfo = \Yii::$app->wechat->getMemberByCode( $code ); // 从微信获取用户
        //        $memberInfo['openid'] = 'oEQpts_MMapxllPTfwRw0VfGeLSg'; // 测试
        $data = [
            'wx_id'      => $memberInfo['openid'] ,
            'username'   => $memberInfo['openid'] ,
            'password'   => 'wx_xx' ,
            'login_type' => 3 ,
            'sex'        => ($memberInfo['sex'] == 2) ? 0 : 1
        ];

        $user = User::getInstance()->findOne( [ 'wx_id' => $data['wx_id'] ] );
        if ( ! $user ) { // 用户不存在，写入数据
            $userInfo = \common\models\User::getInstance()->addUser($data);
            //User::getInstance()->addUser( $data );
            $data['id'] = $userInfo['id'];
            $user       = $data;
        }
        // 写入登录日志
        $log['user_id']     = $user['id'];
        $log['type']        = 1;
        $log['create_time'] = time();
        \common\models\User::getInstance()->userLog($log);

        return $user;
    }
}