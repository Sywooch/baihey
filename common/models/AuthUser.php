<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/6/6
 * Time: 19:48
 */

namespace common\models;


use yii\db\Query;

class AuthUser extends Base
{

    /**
     * 获取用户红娘
     * @param $where
     * @return array
     */
    public function getUserMatchmaker($where)
    {

        if($where['matchmaker']) {
            $arr = explode('-', $where['matchmaker']);
            $condition = ['in', 'id', $arr];
        } else {
            $condition = ['duty' => 1];
        }
        $row = (new Query())->select(['name', 'id as job', 'phone', 'landline', 'qq', 'wechat', 'email', 'introduction', 'photo', 'address'])
            ->from($this->tablePrefix.'auth_user')
            ->where($condition)
            ->andWhere(['status' => 1])
            ->all();

        return $row;
    }

    /**
     * 获取角色下面的用户
     * @param $role
     * @param $flag
     * @return array
     */
    public function getUserByRole($role,$flag = 'in'){
        return (new Query())->from($this->tablePrefix.'auth_assignment a')
            ->innerJoin($this->tablePrefix.'auth_user u' , 'a.user_id=u.id')
            ->where(['status'=>1])
            ->andWhere([$flag, "item_name", $role])
            ->select("u.id,u.name")
            ->all();
    }

    public function getNodeByName($name){

        return (new Query())->from($this->tablePrefix . 'auth_item')
            ->where(['description'=>$name])
            ->select("*")
            ->one();
    }
}