<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/14
 * Time: 16:51
 */

namespace backend\controllers;

use yii\web\Controller;
use backend\models\User;
use yii\web\YiiAsset;

class LoginController  extends Controller{

    public $enableCsrfValidation = false;

    public function actionIndex(){
        $this->layout = false;

        if($_POST) {
            $user = new User();
            $userInfo = $user->getFindUser(['name'=>$_POST['name']]);
            $pass = md5(md5($_POST['password']));
            \Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;  //将响应数据转json格式
            if($userInfo['password'] === $pass) {                           //验证用户登录信息
                $user->setUserSession($userInfo);                           //设置Session
                return ['msg'=>'登录成功！','status'=>1];
            } else {
                return ['msg'=>'登录失败！','status'=>0];
            }
        }
        return $this->render('index.html');
    }

    public function actionLogout() {
        \Yii::$app->session->remove(USER_SESSION);
        $this->redirect('login');
    }
}