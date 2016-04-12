<?php
namespace wechat\models;

use common\util\Cookie;
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
     * @param $userName
     * @param $password
     * @return bool
     */
    public function login($userName, $password)
    {

        $condition = [
            'username' => $userName,
            'password' => md5(md5($password))
        ];
        if ($user = $this->findOne($condition)) {
            $time = YII_BEGIN_TIME;
            $user->last_login_time = $time;
            $user->save(false);
            // 写入用户日志表
            $log['user_id'] = $user->id;
            $log['type'] = 1;
            $log['time'] = $time;
            $this->userLog($log);
            Cookie::getInstance()->setCookie('bhy_id',$user['id']);
            return $user;
        }

        return false;
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
        $time = YII_BEGIN_TIME;
        $data['reg_time'] = $time;
        $data['last_login_time'] = $time;

        // user表 数据写入
        $user = $db->createCommand()
            ->insert($this->tableName(), $data)
            ->execute();

        if ($user) {
            $id = $db->getLastInsertID();// 获取id
        }

        // user_information表 数据处理
        $infoData['user_id'] = $id;
        $userInfo = [
            'head_pic' => '未知',
            'real_name' => '未知',
            'identity_id' => '未知',
            'age' => '未知',
            'height' => '未知',
            'level' => '未知',
            'is_marriage' => '未知',
        ];
        $infoData['info'] = json_encode($userInfo);
        $infoData['city'] = 1;

        // user_information表 数据写入
        $info = $db->createCommand()
            ->insert('bhy_user_information', $infoData)
            ->execute();

        if ($user && $info) {

            $transaction->commit();
            // 写入用户日志表
            $log['user_id'] = $id;
            $log['type'] = 2;
            $log['time'] = $time;
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
        $joinTable = \Yii::$app->getDb()->tablePrefix . $this->_user_information_table;
        $row = (new Query())
            ->select('*')
            ->from(static::tableName() . ' u')
            ->innerJoin($joinTable . ' i', "u.id=i.user_id")
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
    public function userLog($log)
    {

        $userLog = Base::getInstance('user_log');
        $userLog->user_id = $log['user_id'];
        $userLog->type = $log['type'];
        $userLog->time = $log['time'];
        $userLog->ip = ip2long($_SERVER["REMOTE_ADDR"]);
        return $userLog->insert(false);
    }

    /**
     * 获取用户列表
     * @return array
     */
    public function userList($where = [])
    {
        // 查询条件处理
        $where = $this->getUserListWhere($where, 3);
        $offset = $where['offset'];
        $condition = [
            'i.city' => 1,
            'u.sex' => 0,
        ];
        $condition = $this->processWhere($where['where']);
        $joinTable = \Yii::$app->getDb()->tablePrefix . $this->_user_information_table;

        $result = (new Query())->select(['*'])
            ->where($condition)
            //->andWhere(['<>', "json_extract(info,'$.head_pic')", '未知'])
            //->andWhere($where['where'])
            ->from(static::tableName() . ' u')
            ->innerJoin($joinTable . ' i', "u.id=i.user_id")
            //->limit(3)
            //->offset($offset)
            ->all();

        return $result;
    }

    public function getUserListWhere($where, $pageSize = 10) {

        if($where) {

            foreach ($where as $key => $val) {

                switch ($key) {
                    case 'pageNum':
                        $data['offset'] = ($val - 1) * $pageSize;
                        break;
                    case 'age':
                        $data['where'] = ['age' => $where['age']];
                        break;
                    default:
                        $data['where'][] = [$key => $val];
                        break;
                }
            }
        }
        return $data;
    }
}