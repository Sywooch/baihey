<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/10
 * Time: 10:16
 */

namespace wechat\controllers;


use yii\base\Exception;
use yii\web\Controller;

class BaseController extends Controller{

    public $enableCsrfValidation = false;

    protected $assign = [];

    public function init() {

    }
    /**
     * 判断是否登录
     * @return bool
     */
    public function isLogin()
    {

        return false;
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
        $arr = array_merge($params , $this->assign);
        return parent::render( $view , $arr);
    }

    public function renderAjax( $params = [ ] , $view='' ) {

        if ($view == '') $view = \Yii::$app->controller->action->id;
        $view = $view . ".html";
        $arr = array_merge($params , $this->assign);
        echo json_encode($arr);exit;
        return parent::renderAjax( $view , $arr );

    }

    public function assign($field , $value){

        $this->assign[$field] = $value;
    }

    /**
     * 404页面
     */
    public function actionError(){

        $view = "/".\Yii::$app->request->pathInfo;
        return $this->render([],$view);
    }
}