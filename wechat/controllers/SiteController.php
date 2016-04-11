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
     * Displays homepage.
     *
     * @return mixed
     */
    public function actionIndex()
    {
        return $this->render();
    }

    /**
     * 首页列表页
     */
    public function actionUserList(){
        var_dump($this->get);exit;
        $list = User::getInstance()->userList($this->get);
        $this->renderAjax(['status=>1' , 'data'=>$list] );
    }




}
