<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/4/5
 * Time: 14:09
 */

namespace common\util;


class Cookie {

    static $instance;

    public static function getInstance(){
        $class = get_called_class();
        if (!isset(self::$instance[$class])){
            $obj = new $class;
            self::$instance[$class] = $obj;
        }
        return self::$instance[$class];
    }

    public function setCookie($name , $value){
        $cookies = \Yii::$app->response->cookies;
        $cookies->add( new \yii\web\Cookie( [
            'name'   => $name ,
            'value'  => $value ,
            'expire' => time() + 30 * 24 * 3600
        ] ) );
        return true;
    }

    public function getCookie($name){
        $cookies = \Yii::$app->request->cookies;
        return $cookies->get($name);
    }

    public function delCookie($name){
        setcookie($name, "", time()-3600);//把失效日期设置为过去1小时
        unset($_COOKIE[$name]);
        $cookies = Yii::$app->request->cookies;

        $cookies->remove($name);
        return true;
    }

    public function checkCookie($name){
        $cookies = Yii::$app->request->cookies;

        if (isset($cookies[$name])){
            return true;
        }
        return false;
    }
}