<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/10
 * Time: 10:16
 */

namespace wechat\controllers;


use yii\web\Controller;

class BaseController extends Controller{

    public $enableCsrfValidation = false;

    protected $assign = [];
    /**
     * 判断是否登录
     * @return bool
     */
    public function isLogin()
    {

        return true;
    }

    /**
     * 成功跳转
     * @param $message
     * @param string $url
     * @return \yii\web\Response
     */
    public function __success($message, $url = "")
    {
        setcookie("alert_message", json_encode(['status' => 1, 'message' => $message]));
        if ($url == "") {
            $url = $_SERVER['HTTP_REFERER'];
        }
        return $this->redirect($url);
    }

    public function __error($message, $url = "")
    {
        setcookie("alert_message", json_encode(['status' => 0, 'message' => $message]));
        if ($url == "") {
            $url = $_SERVER['HTTP_REFERER'];
        }
        return $this->redirect($url);
    }


    public function render( $params = [ ] , $view='' ) {

        if ($view == '') $view = \Yii::$app->controller->action->id;
        $view = $view . ".html";
        array_merge($params , $this->assign);
        return parent::render( $view , $this->assign );
    }

    public function assign($field , $value){

        $this->assign = [$field , $value];
    }

}