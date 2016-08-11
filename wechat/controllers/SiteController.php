<?php
namespace wechat\controllers;

use common\util\Cookie;
use wechat\models\User;


/**
 * Site controller
 */
class SiteController extends BaseController
{

    /**
     * 错误处理
     */
    public function actionError()
    {
        if($error=\Yii::$app->errorHandler)
        {
            return $this->render([],'error');
        }
    }

    public function actionHref(){
        echo '<script>';
        echo 'location.href="http://wechat.baihey.com/wap/site/main#/index"';
        echo '</script>';
        exit;
    }

    /**
     * Displays homepage.
     *
     * @return mixed
     */
    public function actionMain()
    {
        echo 12;
        if($user_id = Cookie::getInstance()->getCookie('bhy_id')) {
            $user = User::getInstance()->findOne(['id' => $user_id]);
        } else {
            $user = $this->weChatMember();
        }

        if($user['status'] > 2) {
            Cookie::getInstance()->delLoginCookie();
            if($user['wx_id']) {
                setcookie('wx_login', 'out', time() + 3600 * 24 * 30, '/wap');
            }
        }

        echo 1231;exit;
        return $this->render();
    }

    public function actionIndex()
    {
       echo "<script>";
        echo "window.location.href='/wap/site/main#/index'";
       echo "</script>";
    }

    /**
     * 首页列表页
     */
    public function actionUserList(){
        $list = User::getInstance()->userList($this->get);
        $this->renderAjax(['status' => 1, 'data'=>$list] );
    }




}
