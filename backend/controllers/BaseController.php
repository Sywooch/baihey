<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/1/18
 * Time: 16:09
 */

namespace backend\controllers;

use yii\web\Controller;


class BaseController extends Controller
{

    public $enableCsrfValidation = false;

    protected $assign = [];

    public function auth($userId, $name)
    {


    }

    public function beforeAction($action)
    {
        if (!$this->isLogin()) {
            return $this->redirect("/admin/login/login");   //用户未登录自动跳转至登录页
        }


        $this->view->params['act'] = $this->action->id; // layouts/main.php传值
        $this->assign('act',$this->action->id);         // 当前页面action名称

        return parent::beforeAction($action); // TODO: Change the autogenerated stub
    }

    /**
     * 判断是否登录
     * @return bool
     */
    public function isLogin()
    {
        if(\Yii::$app->session->get(USER_SESSION)) {
            return true;
        } else {
            return false;
        }
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

    public function assign($field , $value){
        $this->assign[$field] = $value;
    }

    public function display(){

    }
}