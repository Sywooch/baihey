<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/1/18
 * Time: 16:09
 */

namespace backend\controllers;

use backend\models\User;
use yii\web\Controller;
use yii\web\Cookie;


class BaseController extends Controller
{

    public $enableCsrfValidation = false;

    protected $assign = [];

    protected $user;

    public function auth($userId, $name)
    {


    }

    public function beforeAction($action)
    {

        if (!$this->isLogin()) {
            $this->layout = false;
            return $this->redirect("/admin/login");   //用户未登录自动跳转至登录页
        }
            $user = new User();
            $user->setUser(\Yii::$app->session->get(USER_SESSION));
            \Yii::$app->view->params['user'] = $user->getUser(); // 当前用户
            $this->isCan();//权限验证

            // 面包屑导航

            $title1 = $_COOKIE['clickOptText'];
            $title2 = $_COOKIE['clickOptText2'];
            $optUrl = $_COOKIE['clickOptUrl'];
            \Yii::$app->view->params['title1'] = $title1;
            \Yii::$app->view->params['title2'] = $title2;
            \Yii::$app->view->params['optUrl'] = $optUrl;

        return parent::beforeAction($action); // TODO: Change the autogenerated stub
    }

    /**
     * 权限验证
     * @return bool
     */
    public function isCan() {

        $auth = \Yii::$app->authManager;
        $action = explode('?',\Yii::$app->request->getUrl());
        //$reAction = explode('.com',$_SERVER['HTTP_REFERER']);
        $userInfo = \Yii::$app->session->get(USER_SESSION);
        if ($userInfo['name'] == 'admin') return true;
        $uid = $userInfo['id'];
        $permissions = $auth->getPermissionsByUser($uid);

        foreach($permissions as $vo) {
            if($action[0] == $vo->description) {
                return true;
            }
        }
        $this->__error('对不起，您现在还没获此操作的权限');

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