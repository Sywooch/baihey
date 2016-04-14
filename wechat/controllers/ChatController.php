<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/10
 * Time: 15:45
 */

namespace wechat\controllers;


use common\util\Cookie;
use Faker\Provider\Base;

class ChatController extends BaseController {

    public function actionIndex() {

        return $this->render();
    }

    public function actionChat() {
        $config = str_replace( "\"" , "'" , json_encode( \Yii::$app->wechat->jsApiConfig( [ ] , false ) ) );
        $config = addslashes( $config );
        $this->assign( 'config' , $config );

        return $this->render( [
            'name'     => \Yii::$app->request->get( 'name' ) ,
            'sendName' => \Yii::$app->request->get( 'sendName' )
        ] , '' );
    }

    public function actionConfig() {
//        $config = str_replace( "\"" , "'" , json_encode( \Yii::$app->wechat->jsApiConfig( [ ] , true ) ) );
        $config = json_encode( \Yii::$app->wechat->jsApiConfig( [ ] , true ) );
        $this->assign( 'config' , $config );

        $this->renderAjax();
    }


    public function actionRecord() {

        $this->assign( 'config' , json_encode( \Yii::$app->wechat->jsApiConfig( [ ] , false ) ) );

        return $this->render();
    }

    public function actionList() {

        return $this->render();
    }

    public function actionAngular() {
        $this->assign( 'str' , 'nsk' );

        return $this->render();
    }

    public function actionMeizi() {
        $this->layout = false;

        return $this->render();
    }

    public function actionFocus() {

        return $this->render();
    }


}