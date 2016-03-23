<?php
namespace common\charge;

use Yii;

/**
 * 支付方式类
 * Class ChargeType
 * @package common\models
 */
class ChargeType extends Base
{
    /**
     * @return string 返回该AR类关联的数据表名
     */
    public static function tableName()
    {
        return 'charge_type';
    }

    /**
     * 获取所有支付方式
     * @param string $status
     * @return static[]
     */
    public function getAllList($status = ''){
        $status = $status == "" ? 1 : $status;
        return $this->findAll(['status'=>$status]);
    }

    /**
     * 根据一个或多个条件查询一条记录
     * @param $condition
     * @return null|static
     */
    public function getOne($condition){
        return $this->findOne($condition);
    }


}
