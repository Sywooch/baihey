<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/10
 * Time: 12:05
 */

namespace wechat\controllers;


use wechat\controllers\BaseController;

class ChatController extends BaseController{

    public function actionIndex(){

        return $this->render();
    }
}