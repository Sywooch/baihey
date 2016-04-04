<?php
namespace wechat\controllers;

use wechat\models\User;

/**
 * 登录 控制层
 * Class UserController
 * @package wechat\controllers
 */
class UserController extends BaseController
{

    public function beforeAction($action)
    {
        $this->layout = false;
        return parent::beforeAction($action);
    }

    public function actionLogin()
    {
        return $this->render();
    }

    public function actionWelcome()
    {
        $this->weChatMember();
        return $this->render();
    }

    public function actionRegister()
    {
        if(\Yii::$app->request->isPost) {
            $userModel = new User();
            $data = \Yii::$app->request->post();
            $data = json_encode($data);
            var_dump($data);exit;
            if($userModel->addUser($data)) {
                \Yii::$app->messageApi->passwordMsg(15084410950,substr($data['mobile'],-6));
                $this->renderAjax(['status'=>1,'msg'=>'注册成功']);
            } else {
                $this->renderAjax(['status'=>0,'msg'=>'注册失败']);
            }
        }

        return $this->render();
    }

    public function actionForgetpass(){

        return $this->render();
    }

    /**
     * 验证手机号是否存在
     * @return string
     */
    public function actionMobileIsExist()
    {
        if (\Yii::$app->request->isGet) {
            $data = \Yii::$app->request->get();
            $userModel = new User();
            if($userModel->getMobileExist($data['mobile'])){
                $this->renderAjax(['status' => 0, 'msg' => '手机号码已存在']);
            }else{
                $this->renderAjax(['status' => 1, 'msg' => '该手机号可以注册']);
            }
        }
    }

    /**
     * 发送手机验证码
     */
    public function actionSendCodeMsg(){
        if (\Yii::$app->request->isGet) {
            $data = \Yii::$app->request->get();
            $this->renderAjax(['status'=>\Yii::$app->messageApi->sendCode($data['mobile']),'reg_code'=>\Yii::$app->session->get('reg_code')]);
        }
    }

    /**
     * 验证客户端输入验证码是否与服务端一致
     */
    public function actionValidateCode(){
        if (\Yii::$app->request->isGet) {
            $data = \Yii::$app->request->get();
            $this->renderAjax(['status'=>\Yii::$app->messageApi->validataCode($data['code'])]);
        }
    }

}