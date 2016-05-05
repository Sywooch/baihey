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
class User extends \common\models\Base
{

    protected $user;
    protected $user_id;
    protected $_user_information_table = 'user_information';

    public static function tableName()
    {
        return \Yii::$app->db->tablePrefix . 'user';
    }

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
            $data = $this->getUserByName($userName);
            // 写入用户日志表
            $log['user_id'] = $user->id;
            $log['type'] = 1;
            $log['time'] = $time;
            $this->userLog($log);

            // 设置cookie
            Cookie::getInstance()->setCookie('bhy_u_name', $user['username']);
            Cookie::getInstance()->setCookie('bhy_id', $user['id']);
            // 浏览器使用的cookie
            setcookie('bhy_user_id', $user['id'], $time + 3600 * 24 * 30, '/wap');
            setcookie('bhy_u_sex', $user['sex'], $time + 3600 * 24 * 30, '/wap');

            return $data;
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
            'age'                   => '未知',// 出生年月时间戳
            'level'                 => '未知',// vip等级
            'local'                 => '未知',// 当地地区（地区切换使用）
            'height'                => '未知',// 身高
            'head_pic'              => '未知',// 头像
            'real_name'             => '未知',// 真实姓名
            'identity_id'           => '未知',// 省份证号码
            'is_marriage'           => '未知',// 婚姻状况
            'is_child'              => '未知',// 子女状况
            'education'             => '未知',// 学历
            'year_income'           => '未知',// 年收入
            'is_purchase'           => '未知',// 购房状况
            'is_car'                => '未知',// 购车状况
            'occupation'            => '未知',// 职业
            'children_occupation'   => '未知',// 子职业
            'zodiac'                => '未知',// 属相生肖
            'constellation'         => '未知',// 星座
            'nation'                => '未知',// 民族
        ];
        // 身份证照片
        $userIdentity = [
            'url1'          => '未知',// 正面
            'url2'          => '未知',// 反面
            'is_check'      => '未知',// 审核状态1通过，0未通过
            'create_time'   => '未知',// 时间
        ];
        $infoData['identity_pic'] = json_encode($userIdentity);
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
            ->where(['u.username' => $name]);

        //echo $row->createCommand()->getRawSql();exit;
        $row = $row->one();

        if (!$row) {
            return null;
        }

        return $row;
    }

    public function getUserById($id)
    {
        $joinTable = \Yii::$app->getDb()->tablePrefix . $this->_user_information_table;
        $row = (new Query())
            ->select('*')
            ->from(static::tableName() . ' u')
            ->innerJoin($joinTable . ' i', "u.id=i.user_id")
            ->where(['u.id' => $id]);

        //echo $row->createCommand()->getRawSql();exit;
        $row = $row->one();

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

        $userLog = \common\models\Base::getInstance('user_log');
        $userLog->user_id = $log['user_id'];
        $userLog->type = $log['type'];
        $userLog->create_time = $log['time'];
        $userLog->ip = ip2long($_SERVER["REMOTE_ADDR"]);
        return $userLog->insert(false);
    }

    /**
     * 获取用户列表
     * @return array
     */
    public function userList($where = [])
    {
        $pageSize = isset($where['pageSize']) ? $where['pageSize'] : 6;
        if (isset($where['cityName'])) {
            setcookie('bhy_u_city', json_encode($where['cityName']), YII_BEGIN_TIME + 3600 * 24 * 30, '/wap');
            setcookie('bhy_u_cityId', $where['city'], YII_BEGIN_TIME + 3600 * 24 * 30, '/wap');
            unset($where['cityName']);
        }
        unset($where['pageSize']);
        // 查询条件处理
        $where = $this->getUserListWhere($where, $pageSize);
        $offset = $where['offset'];

        $condition = $this->processWhere($where['where']);
        $joinTable = \Yii::$app->getDb()->tablePrefix . $this->_user_information_table;

        $result = (new Query())->select(['*'])
            ->where($condition)
            ->from(static::tableName() . ' u')
            ->innerJoin($joinTable . ' i', "u.id=i.user_id")
            ->orderBy('last_login_time desc')
            ->limit($pageSize)
            ->offset($offset);

        //echo $result->createCommand()->getRawSql();
        $result = $result->all();
        return $result;
    }

    /**
     * 获取userlist条件
     * @param $where
     * @param int $pageSize
     * @return mixed
     */
    public function getUserListWhere($where, $pageSize = 10)
    {
        $where['pageNum'] = isset($where['pageNum']) ? $where['pageNum'] : 1;

        if (isset($where['id']) && is_numeric($where['id'])) {

            $data['offset'] = ($where['pageNum'] - 1) * $pageSize;
            $data['where']['id'] = $where['id'];
        } else {

            foreach ($where as $key => $val) {

                switch ($key) {
                    case 'city':
                    case 'sex' :
                        if (is_numeric($val)) {
                            $data['where'][$key] = $val;
                        }
                        break;

                    case 'pageNum':
                        $data['offset'] = ($val - 1) * $pageSize;
                        break;

                    case 'age':
                        if (is_numeric($val)) {
                            if ($val != 0) {
                                $age = $this->getTimestampByAge($val);
                                $data['where']["json_extract(info,'$.age')"] = ['>=', $age];
                            }
                        } else {

                            $age = explode('-', $val);
                            $age1 = $this->getTimestampByAge($age[0]);
                            $age2 = $this->getTimestampByAge($age[1]);
                            $data['where']["json_extract(info,'$.age')"] = ['between' => [$age2, $age1]];
                        }
                        break;

                    case 'height':
                        if ($val != 0) {
                            $data['where']["json_extract(info,'$.height')"] = $this->getRangeWhere($val);
                        }
                        break;

                    default:
                        if ($val != 0) {
                            $data['where']["json_extract(info,'$." . $key . "')"] = $val;
                        }
                        break;
                }
            }
        }
        $data['where']['is_show'] = 1;
        $data['where']["json_extract(info,'$.head_pic')"] = ['!=' => '未知'];

        return $data;
    }

    /**
     * 获取年龄生日时间戳
     * @param $age
     * @return int
     */
    public function getTimestampByAge($age)
    {

        $time = time();
        $year = date('Y', $time) - $age;
        $date = date('-m-d');
        $ageTimestamp = strtotime($year . $date);
        //$date = date('Y-m-d',$ageTimestamp);
        return $ageTimestamp;
    }

    /**
     * 获得范围条件
     * @param $data
     * @return array
     */
    public function getRangeWhere($data)
    {
        if (is_numeric($data)) {

            $where = ['>=', $data];
        } else {

            $data = explode('-', $data);
            $where = ['between' => [$data[0], $data[1]]];
        }
        return $where;
    }

    /**
     * 修改余额
     * @param $uid
     * @param $money
     * @return int
     * @throws \yii\db\Exception
     */
    public function changeBalance($uid, $money)
    {

        $user = User::findOne($uid);
        $user->balance = $user->balance - $money;
        return $user->save();
    }

    /**
     * 打开红包
     * @param $briberyId
     * @return int
     * @throws \yii\db\Exception
     */
    public function openBribery($briberyId)
    {
        $tran = \Yii::$app->db->beginTransaction();
        $bribery = UserBribery::findOne($briberyId);
        if ($bribery->status == 1) return -1; // 红包已经领取

        $bribery->status = 1;
        if ($bribery->save() && $this->changeBalance($bribery->receive_user_id, -$bribery->money)) {
            $tran->commit();
            return 1;
        }
        $tran->rollBack();
        return 0;
    }
}