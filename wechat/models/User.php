<?php
namespace wechat\models;

use yii\db\Query;

/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/10
 * Time: 10:21
 */
class User extends Base
{

    protected $user;
    protected $user_id;
    protected $_user_information_table = 'user_information';

    /**
     * 用户登录
     * @param $username
     * @param $password
     * @return bool
     */
    public function login($username, $password)
    {

        $condition = [
            'username' => $username,
            'password' => md5(md5($password))
        ];
        if ($user = $this->findOne($condition)) {
            $user->last_login_time = YII_BEGIN_TIME;
            $user->save(false);
            // 写入用户日志表
            $log['user_id'] = $user->id;
            $log['type'] = 1;
            $this->userLog($log);
            return $user;
        }

        return false;
    }

    public function validate($attributeNames = null, $clearErrors = true)
    {

    }

    /**
     * 新增/注册用户
     * @param $data
     * @return bool
     * @throws \yii\db\Exception
     */
    public function addUser($data)
    {

        $db = $this->getDb();
        $transaction = $db->beginTransaction();// 启动事件

        // 数据处理
        $data['password'] = md5(md5($data['password']));
        $data['reg_time'] = YII_BEGIN_TIME;
        $data['last_login_time'] = YII_BEGIN_TIME;

        // user表 数据写入
        $user = $db->createCommand()
            ->insert($this->tableName(), $data)
            ->execute();

        if($user) {
            $id = $db->getLastInsertID();// 获取id
        }

        // user_information表 数据处理
        $infoData['user_id'] = $id;
        $userInfo = [
            'real_name'     => '未知',
            'identity_id'   => '未知',
            'age'           => '未知',
            'height'        => '未知',
            'level'         => '未知',
            'is_marriage'   => '未知',
        ];
        $infoData['info'] = json_encode($userInfo);
        $infoData['city'] = 1;

        // user_information表 数据写入
        $info = $db->createCommand()
            ->insert('bhy_user_information', $infoData)
            ->execute();

        if($user && $info) {

            $transaction->commit();
            // 写入用户日志表
            $log['user_id'] = $id;
            $log['type'] = 2;
            $this->userLog($log);
        } else {

            $transaction->rollBack();
        }

        return $id;
    }

    /**
     * 通过用户名返回用户信息
     * @param $name
     * @return array|bool|null
     */
    public function getUserByName($name)
    {
        $row = (new Query())
            ->select('*')
            ->from($this->tableName())
            ->where(['username' => $name])
            ->one();

        if (!$row) {
            return null;
        }

        return $row;
    }

    /**
     * 用户操作日志
     */
    public function userLog($log){

        $userLog = Base::getInstance('user_log');
        $userLog->user_id = $log['user_id'];
        $userLog->type = $log['type'];
        $userLog->time = time();
        $userLog->ip = ip2long($_SERVER["REMOTE_ADDR"]);
        return $userLog->insert(false);
    }
}