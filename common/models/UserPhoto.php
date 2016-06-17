<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/5/9
 * Time: 10:33
 */

namespace common\models;

use Yii;
use yii\db\Query;

class UserPhoto extends Base
{

    /**
     * 新增相片
     * @param $user_id
     * @param $data array
     * @return bool
     * @throws \Exception
     */
    public function addPhoto($user_id, $data)
    {
        // 个人相册不得多于12张
        $sum = $this->find()->where(['user_id' => $user_id])->count('id');
        if (12 >= $sum) {
            $this->user_id = $user_id;
            $this->pic_path = $data['pic_path'];
            $this->thumb_path = $data['thumb_path'];
            $this->create_time = $data['time'];
            $this->update_time = $data['time'];
            /*if(0 == $sum) {
                $this->is_head = 1;
                UserInformation::getInstance()->updateUserInfo($user_id, ['head_pic' => $data['thumb_path']]);
            }*/
            $this->insert(false);
            return $this->getDb()->getLastInsertID();
        } else {
            return false;
        }
    }

    public function addPhotoComment($data){
        $this->getDb()->createCommand()
            ->insert($this->tablePrefix.'user_photo', $data)
            ->execute();
    }

    /**
     * 获取相册列表
     * @param $user_id
     * @return $this|array
     */
    public function getPhotoList($user_id)
    {
        $result = (new Query())->select(['*'])
            ->where(['user_id' => $user_id])
            ->from(static::tableName())
            ->orderBy('is_head desc, update_time asc')
            ->limit(12);

        $result = $result->all();
        return $result;
    }

    /**
     * 删除相片
     * @param $where
     * @return int
     */
    public function delPhoto($where)
    {
        $row = $this->deleteAll(['id' => $where['id']]);
        return $row;
    }

    /**
     * 设置头像
     * @param $user_id
     * @param $where
     * @return int
     */
    public function setHeadPic($user_id, $where) {
        //var_dump($where);exit;
        $this->getDb()->createCommand()
            ->update($this->tablePrefix.'user_photo' , ['is_head' => 0] , ['user_id' => $user_id, 'is_head' => 1])
            ->execute();
        $row = $this->getDb()->createCommand()
            ->update($this->tablePrefix.'user_photo' , ['is_head' => 1] , ['id' => $where['id']])
            ->execute();
        return $row ? UserInformation::getInstance()->updateUserInfo($user_id, ['head_pic' => $where['thumb_path']]) : false;
    }

    /**
     * 获取用户上传的照片
     * @param int $isCheck 2：未审核 1：审核通过 0：不通过
     * @param int $type 1:照片 2：身份证，3：学历证 ， 4：离婚证 5房产证
     * @return array
     */
    public function lists($isCheck = 2 , $type = 1){

        $handle = (new Query())->from($this->tablePrefix.'user_photo u')
            ->innerJoin($this->tablePrefix.'user_information i' , 'u.user_id=i.user_id')
            ->where(['is_check' => $isCheck , 'type'=>$type])
            ->limit(1000)
            ->orderBy("u.create_time")
            ->select(['u.id','u.user_id','u.type','u.thumb_path','u.create_time','is_check','is_head',"json_extract(i.info , '$.real_name') as real_name"]);
        if ($isCheck != ''){
            $handle->andWhere(['is_check'=>$isCheck]);
        }
        return $handle->all();
    }

    /**
     * 审核照片
     * @param $id
     * @param $status
     * @return int
     * @throws \yii\db\Exception
     */
    public function auth($id , $status){
        $ids = explode("," , $id);

        $handle = $this->getDb()->createCommand()
            ->update($this->tablePrefix.'user_photo' , ['is_check'=>$status] , ['id'=>$ids]);
        $r = $handle->execute();
        return $r;
    }
}