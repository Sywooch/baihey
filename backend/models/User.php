<?php
namespace backend\models;
use yii\base\Model;
use yii\db\Connection;
use yii\db\Query;
use yii\di\Instance;

/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/2/22
 * Time: 16:31
 */
class User extends Model
{
    public $db = 'db';

    public $file;

    public $userTable = '{{%auth_user}}';

    public function init()
    {
        parent::init();
        $this->db = \Yii::$app->db;
    }

    public function rules()
    {
        return [
                [['file'], 'file']
            ];
    }

    /**
     * @return array|null
     * 获取列表
     */
    public function getList() {
        $row = (new Query)
            ->select(['id', 'name', 'password', 'status', 'created_at', 'updated_at'])
            ->from($this->userTable)
            ->where(['status' => 1])
            ->all();

        if ($row === false) {
            return null;
        }
        return $row;
    }

    /**
     * @param array $where
     * @return array|bool|null
     * 获取单条记录
     */
    public function getFindUser($where=[])
    {
        $row = (new Query)
            ->select(['id', 'name', 'password', 'status', 'created_at', 'updated_at'])
            ->from($this->userTable)
            ->where($where)
            ->one($this->db);

        if ($row === false) {
            return null;
        }
        return $row;
    }

    /**
     * @param array $where
     * @param string $order
     * @param string $limit
     * @return $this|array|null
     * 获取用户列表
     */
    public function getListUser($where=[],$order='',$limit='') {
        if(!$limit) {
            $row = (new Query)
                ->select(['id', 'name', 'password', 'status', 'created_at', 'updated_at'])
                ->from($this->userTable)
                ->where($where)
                ->orderBy($order)
                ->all();
        } else {
            $row = (new Query)
                ->select(['id', 'name', 'password', 'status', 'created_at', 'updated_at'])
                ->from($this->userTable)
                ->where($where)
                ->orderBy($order)
                ->limit($limit);
        }
        if ($row === false) {
            return null;
        }
        return $row;
    }

    /**
     * @param $data
     * @return bool
     * @throws \yii\base\Exception
     * 新增用户
     */
    public function addUser($data) {
        $auth = \Yii::$app->authManager;
        $time = time();
        $data['created_at'] = $time;
        $data['updated_at'] = $time;
        $data['password'] = \Yii::$app->security->generatePasswordHash($data['password']);
        if(isset($data['role'])) {
            $role = $data['role'];
            unset($data['role']);
        } else {
            $role = false;
        }
        $this->db->createCommand()
            ->insert($this->userTable, $data)
            ->execute();
        $id = $this->db->getLastInsertID();
        if($id && $role) {
            foreach($role as $vo) {
                $auth->assign($auth->getRole($vo),$id);
            }
        }
        return true;
    }

    /**
     * @param $data
     * @return bool
     * @throws \yii\base\Exception
     * 编辑用户
     */
    public function editUser($data) {
        $auth = \Yii::$app->authManager;
        $time = time();
        $data['updated_at'] = $time;
        if($data['password']) {
            $data['password'] = \Yii::$app->security->generatePasswordHash($data['password']);
        } else {
            unset($data['password']);
        }

        $uid = $data['id'];
        if(isset($data['role'])) {
            $role = $data['role'];
            unset($data['role']);
        } else {
            $role = false;
        }
        $row = $this->db->createCommand()
            ->update($this->userTable, $data, ['id' => $data['id']])
            ->execute();

        $uidRole = $auth->getAssignments($uid);
        if(!empty($uidRole) && !$auth->revokeAll($uid)) {
            $this->__error('清除角色失败');
        }

        //重新分配角色
        if($row && !empty($role)) {
            foreach ($role as $v) {
                if (!$auth->assign($auth->getRole($v), $uid)) {
                    $this->__error('添加失败');
                }
            }
        }
        return true;
    }

    public function delUser($id) {
        if($this->getFindUser(['id' => $id])) {
            //删除用户角色
            /*$auth = \Yii::$app->authManager;
            $uidRole = $auth->getAssignments($id);
            if(!empty($uidRole) && !$auth->revokeAll($id)) {
                $this->__error('清除角色失败');
            }*/

            //更改用户状态
            $row = $this->db->createCommand()
                ->update($this->userTable, ['status' => 0], ['id' => $id])
                ->execute();
            if($row) {
                return true;
            } else {
                return false;
            }
        }

    }
}