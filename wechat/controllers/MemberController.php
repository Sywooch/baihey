<?php
namespace wechat\controllers;

use common\models\Area;
use common\models\Bank;
use common\models\ConsumptionLog;
use common\models\Feedback;
use common\models\User;
use common\models\UserDynamic;
use common\models\UserFollow;
use common\models\UserInformation;
use common\models\UserPhoto;
use common\util\Cookie;
use wechat\models\Config;
use yii\helpers\ArrayHelper;


/**
 * Site controller
 */
class MemberController extends BaseController
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

    public function actionInformation()
    {

        return $this->render();
    }

    /**
     * 保存用户数据
     */
    public function actionSaveData()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        $data = $this->get;
        $data['user'] = $data;
        $data['user_id'] = $user_id;
        if ($data['info']) {
            $data['info'] = json_decode($data['info']);
            if (is_object($data['info'])) {
                $data['info'] = get_object_vars($data['info']);
                $data['info']['age'] = (int)$data['info']['age'];
            }
        } else {
            $data['info'] = [];
        }

        if (User::getInstance()->editUser($data)) {
            $this->renderAjax(['status' => 1, 'msg' => '修改成功']);
        } else {
            $this->renderAjax(['status' => 0, 'msg' => '修改失败']);
        }
    }

    /**
     * 相册列表
     */
    public function actionPhotoList()
    {
        $user_id = isset($this->get['user_id']) ? $this->get['user_id'] : Cookie::getInstance()->getCookie('bhy_id')->value;
        $type = isset($this->get['type']) ? $this->get['type'] : 1;
        $pageSize = isset($this->get['pageSize']) ? $this->get['pageSize'] : 12;

        $list = UserPhoto::getInstance()->getPhotoList($user_id, $type, $pageSize);
        $this->renderAjax(['status' => 1, 'data' => $list]);
    }

    /**
     * 删除相片
     */
    public function actionDelPhoto()
    {
        $list = UserPhoto::getInstance()->delPhoto($this->get);
        $this->renderAjax(['status' => 1, 'data' => $list]);
    }

    /**
     * 保存图片(目前用于身份认证)
     */
    public function actionSavePhoto()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        $list = [];
        foreach ($this->get as $k => $v) {
            $arr = json_decode($v);
            $thuArr = explode('/', $arr->thumb_path);
            $picArr = explode('/', $arr->pic_path);
            $data[$k]['type'] = $arr->type;
            $data[$k]['pic_path'] = str_replace('thumb', 'picture', $arr->thumb_path);
            $data[$k]['thumb_path'] = $arr->thumb_path;
            if ($thuArr[5] != $picArr[5]) {
                // 删除原有图片
                $pic_path = __DIR__ . "/../.." . $arr->pic_path;
                if (is_file($pic_path) && unlink($pic_path)) {
                    $thumb_path = str_replace('picture', 'thumb', $pic_path);
                    unlink($thumb_path);
                }
            }
            $list = UserPhoto::getInstance()->savePhoto($data, $user_id);
        }
        $this->renderAjax(['status' => 1, 'data' => $list]);
    }

    /**
     * 设置头像
     */
    public function actionSetHead()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        $list = UserPhoto::getInstance()->setHeadPic($user_id, $this->get);
        if ($list) {
            $this->renderAjax(['status' => 1, 'data' => $list]);
        } else {
            $this->renderAjax(['status' => 0, 'msg' => '设置头像失败']);
        }

    }

    /**
     * 获取头像
     */
    public function actionUserHeadpic()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        if ($data = UserPhoto::getInstance()->userHeadpic($user_id)) {
            $this->renderAjax(['status' => 1, 'data' => $data, 'msg' => '获取数据成功']);
        } else {
            $this->renderAjax(['status' => 0, 'data' => [], 'msg' => '获取数据失败']);
        }
    }

    /**
     * 类型为2,3的地方列表
     */
    public function actionWentTravelList()
    {
        $this->renderAjax(['status' => 1, 'data' => Area::getInstance()->getWentTravelList()]);
    }

    /**
     * 类型为2的地方列表
     */
    public function actionWantTravelList()
    {
        $pageIndex = $this->get['pageIndex'];
        $province_id = $this->get['province_id'] ? $this->get['province_id'] : 1;// 默认重庆
        $list = Area::getInstance()->getWantTravelList($province_id, $pageIndex);

        $this->renderAjax(['status' => 1, 'data' => $list]);
    }

    /**
     * 运动，电影，美食之一列表
     */
    public function actionConfigList()
    {
        $list = Config::getInstance()->getListByType($this->get['type']);
        $this->renderAjax(['status' => 1, 'data' => $list]);
    }

    /**
     * 获取去过的地方或者想去的地方的地区列表
     */
    public function actionGetTravelList()
    {
        $list = Area::getInstance()->getTravelListById($this->get['area_id']);
        $this->renderAjax(['status' => 1, 'data' => $list]);
    }

    /**
     * 获取去过的地方或者想去的地方的地区列表
     */
    public function actionGetConfigList()
    {
        $list = Config::getInstance()->getListById($this->get['config_id']);
        $this->renderAjax(['status' => 1, 'data' => $list]);
    }

    /**
     * 获取发过的个人动态
     */
    public function actionGetDynamicList()
    {
        isset($this->get['page']) ? $page = $this->get['page'] : $page = 0;
        isset($this->get['limit']) ? $limit = $this->get['limit'] : $limit = 5;
        isset($this->get['user_id']) ? $userId = $this->get['user_id'] : $userId = -1;

        $list = UserDynamic::getInstance()->getDynamicList($userId, $page, $limit);
        $this->renderAjax(['status' => 1, 'data' => $list]);
    }

    /**
     * 获取user_info页面所需信息
     */
    public function actionUserInfoPageById()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        // 获取用户信息
        $userInfo = User::getInstance()->getUserById($this->get['id']);
        // 获取admin用户信息
        $authUser = new \backend\models\User();
        $authUserInfo = $authUser->authUserById($this->get['id']);
        $authUserInfo = $authUserInfo ? $authUserInfo : [];
        // 获取用户相册
        $userPhoto = UserPhoto::getInstance()->getPhotoList($this->get['id']);
        // 获取用户动态
        $dynamic = UserDynamic::getInstance()->getDynamicList($this->get['id']);
        // 获取关注状态
        $followStatus = UserFollow::getInstance()->getFollowStatus(['user_id' => $user_id, 'follow_id' => $this->get['id']]);
        $followStatus = $followStatus ? $followStatus['status'] : false;
        // 获取被关注状态
        $followedStatus = UserFollow::getInstance()->getFollowStatus(['user_id' => $this->get['id'], 'follow_id' => $user_id]);
        $followedStatus = $followedStatus ? $followedStatus['status'] : false;

        if ($userInfo) {
            $this->renderAjax(['status' => 1, 'userInfo' => $userInfo, 'authUserInfo' => $authUserInfo, 'userPhoto' => $userPhoto, 'dynamic' => $dynamic, 'followStatus' => $followStatus, 'followedStatus' => $followedStatus, 'msg' => 'user_info页面获取信息成功']);
        } else {
            $this->renderAjax(['status' => 0, 'userInfo' => $userInfo, 'authUserInfo' => $authUserInfo, 'userPhoto' => $userPhoto, 'dynamic' => $dynamic, 'followStatus' => $followStatus, 'followedStatus' => $followedStatus, 'msg' => 'user_info页面获取信息失败']);
        }
    }

    /**
     * 获取评论数
     */
    public function actionCommentNum()
    {
        $userId = Cookie::getInstance()->getCookie('bhy_id')->value;
        $num = UserDynamic::getInstance()->getCommentByUserId($userId);
        $this->renderAjax(['status' => 1, 'data' => $num]);
    }

    /**
     * 获取评论列表
     */
    public function actionCommentList()
    {

        $userId = Cookie::getInstance()->getCookie('bhy_id')->value;
        $createTime = \Yii::$app->request->get('create_time');
        if ($list = UserDynamic::getInstance()->getComment($userId, $createTime)) {
            return $this->renderAjax(['status' => 1, 'data' => $list, 'message' => '成功']);
        }
        return $this->renderAjax(['status' => 0, 'data' => '', 'message' => '失败']);
    }

    /**
     * 设置点赞
     */
    public function actionSetClickLike()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        if ($this->get['add'] == 1) {
            $flag = User::getInstance()->setClickLike($this->get['dynamicId'], $user_id, $this->get['add']);

        } else {
            $flag = User::getInstance()->cancelClickLike($this->get['dynamicId'], $user_id, $this->get['add']);

        }
        $this->renderAjax(['status' => 1, 'data' => $flag]);
    }

    /**
     * 发布个人动态
     */
    public function actionAddUserDynamic()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        if ($did = UserDynamic::getInstance()->addDynamic($user_id, $this->get)) {
            $data = UserDynamic::getInstance()->getDynamicById($did);
            $this->renderAjax(['status' => 1, 'data' => $data, 'msg' => '发布成功']);
        } else {
            $this->renderAjax(['status' => 0, 'data' => [], 'msg' => '发布失败']);
        }

    }

    /**
     * 获取单条动态内容
     */
    public function actionGetDynamic()
    {

        $data = UserDynamic::getInstance()->getDynamicById($this->get['id']);
        $data['comment'] = User::getInstance()->getCommentById($this->get['id']);
        $this->renderAjax(['status' => 1, 'data' => $data, 'commentCount' => count($data['comment'])]);
    }

    // 删除动态
    public function actionDeleteDynamic()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        if ($data = UserDynamic::getInstance()->editDynamic($user_id, $this->get['id'], ['status' => 0])) {
            $this->renderAjax(['status' => 1, 'data' => $data, 'msg' => '删除成功']);
        } else {
            $this->renderAjax(['status' => 0, 'data' => [], 'msg' => '删除失败']);
        }
    }

    /**
     * 获取动态评论内容
     */
    public function actionGetComment()
    {

        $list = User::getInstance()->getCommentById($this->get['id']);
        $this->renderAjax(['status' => 1, 'data' => $list]);
    }

    /**
     * 发布评论
     */
    public function actionAddComment()
    {

        $data['content'] = $this->get['content'];
        $data['private'] = $this->get['private'] == 'true' ? 1 : 0;
        $data['dynamicId'] = $this->get['dynamicId'];
        $data['create_time'] = time();
        $id = User::getInstance()->addComment($data);
        $this->renderAjax(['status' => 1, 'data' => ['id' => $id, 'create_time' => $data['create_time']]]);
    }

    /**
     * 获取关注列表
     */
    public function actionGetFollow()
    {

        $list = User::getInstance()->getFollowList();
        $this->renderAjax(['status' => 1, 'data' => $list]);
    }

    /**
     * 获取红包信息
     */
    public function actionBriberyInfo()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        $data = User::getInstance()->briberyInfo($user_id);
        $this->renderAjax(['status' => 1, 'data' => $data]);
    }

    /**
     * 获取发送或收到的红包列表
     */
    public function actionBriberyList()
    {

        isset($this->get['page']) ? $page = $this->get['page'] : $page = 0;
        $flag = $this->get['flag'] == 'true' ? true : false;
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        $year = isset($this->get['year']) ? $this->get['year'] : 0;
        $data = User::getInstance()->getBriberyList($user_id, $flag, $page, $year);
        $this->renderAjax(['status' => 1, 'data' => $data]);
    }

    public function actionConsumptionList()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        if ($data = ConsumptionLog::getInstance()->getUserConsumptionLogList($user_id)) {
            $this->renderAjax(['status' => 1, 'data' => $data, 'msg' => '获取数据成功']);
        } else {
            $this->renderAjax(['status' => 0, 'data' => [], 'msg' => '获取数据失败']);
        }
    }

    /**
     * 获取用户银行卡列表
     */
    public function actionCashCardList()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        if ($data = User::getInstance()->getCashCardList($user_id)) {
            $this->renderAjax(['status' => 1, 'data' => $data, 'msg' => '获取数据成功']);
        } else {
            $this->renderAjax(['status' => 0, 'data' => [], 'msg' => '获取数据失败']);
        }
    }

    /**
     * 删除银行卡
     */
    public function actionDelCard()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        if ($data = User::getInstance()->delCard($user_id, $this->get['id'])) {
            $this->renderAjax(['status' => 1, 'data' => $data, 'msg' => '删除数据成功']);
        } else {
            $this->renderAjax(['status' => 0, 'data' => [], 'msg' => '删除数据失败']);
        }
    }

    /**
     * 添加银行卡
     */
    public function actionAddCashCard()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        if ($data = User::getInstance()->addCashCard($user_id, $this->get)) {
            if (empty(json_decode(\common\models\User::getInstance()->getUserById($user_id)['info'])->real_name)) {  // 如果当前用户姓名为空，则保存持卡人姓名到userinfo
                UserInformation::getInstance()->updateUserInfo($user_id, ['real_name' => $this->get['user_name']]);
            }
            $this->renderAjax(['status' => 1, 'data' => $data, 'msg' => '添加银行卡成功']);
        } else {
            $this->renderAjax(['status' => 0, 'data' => [], 'msg' => '添加银行卡失败，可能是您已添加过该银行卡。']);
        }
    }

    /**
     * 获取单张银行卡信息
     */
    public function actionCashCardById()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        if ($data = User::getInstance()->getCashCardById($user_id, $this->get['id'])) {
            $this->renderAjax(['status' => 1, 'data' => $data, 'msg' => '获取数据成功']);
        } else {
            $this->renderAjax(['status' => 0, 'data' => [], 'msg' => '获取数据失败']);
        }
    }

    /**
     * 银行卡列表
     */
    public function actionBankList()
    {
        if ($data = Bank::getInstance()->bankList()) {
            $this->renderAjax(['status' => 1, 'data' => $data, 'msg' => '删除数据成功']);
        } else {
            $this->renderAjax(['status' => 0, 'data' => [], 'msg' => '删除数据失败']);
        }
    }

    // 提现
    public function actionAddCashInfo()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        $data = $this->get;
        $data['money'] = intval($this->get['money']) * 100;   // 单位：分
        $balance = intval(\common\models\User::getInstance()->getUserPropertyValue($user_id, ['balance'])['balance']);  // 获取当前用户余额
        if ($balance < intval($data['money'])) {
            $this->renderAjax(['status' => -1, 'msg' => '提现失败，您当前余额不足']);
        } else {
            if ($data['money'] < 100 || $data['money'] > 10000000) {
                $this->renderAjax(['status' => -2, 'msg' => '提现失败，提现金额异常！']);
            } else {
                if ($id = \common\models\User::getInstance()->addCashInfo($user_id, $data)) {   // 减少余额、插入提现记录
                    $this->renderAjax(['status' => 1, 'data' => $id]);            // 成功
                } else {
                    $this->renderAjax(['status' => 0, 'msg' => '提现失败！']);
                }
            }
        }
    }

    /**
     * 根据ID查询单条提现记录
     */
    public function actionGetWithdrawInfoById()
    {
        if (isset($this->get['id'])) {
            if ($data = \common\models\User::getInstance()->getCashInfo($this->get['id'])) {
                $this->renderAjax(['status' => 1, 'data' => $data]);
            } else {
                $this->renderAjax(['status' => 0, 'msg' => '查询失败或没有相应记录']);
            }
        } else {
            $this->renderAjax(['status' => -1, 'msg' => '参数错误，未获取到参数：id']);
        }
    }

    // 消费记录
    public function actionGetRecordList()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        $withdrawInfo = \common\models\User::getInstance()->getCashInfo(null, $user_id) ? \common\models\User::getInstance()->getCashInfo(null, $user_id) : [];
        $briberyInfoInfo = \common\models\User::getInstance()->getBriberyInfo($user_id) ? \common\models\User::getInstance()->getBriberyInfo($user_id) : [];
        foreach ($withdrawInfo as $v) {
            array_unshift($v, "tx");
        }

        $newArr = ArrayHelper::merge($withdrawInfo, $briberyInfoInfo);
        $lastArr = [];
        foreach ($newArr as $k => $v) {
            $lastArr[date('Y年m月', $v['create_time'])]['date'] = date('Y年m月', $v['create_time']);
            $lastArr[date('Y年m月', $v['create_time'])]['items'][] = $v;
        }
        if (count($lastArr) < 1) {
            $this->renderAjax(['status' => 0, 'msg' => '没有数据']);
        } else {
            $this->renderAjax(['status' => 1, 'data' => $lastArr]);
        }

    }

    // 获取当前用户余额
    public function actionGetUserBalance()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        if ($data = \common\models\User::getInstance()->getUserPropertyValue($user_id, ['balance'])) {
            $this->renderAjax(['data' => $data]);
        } else {
            $this->renderAjax(['data' => 0]);
        }

    }

    // 获取用户正在使用的服务
    public function actionGetUserServiceInfo()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        $data = \common\models\User::getInstance()->getUserPropertyValue($user_id, ['json_extract (info, \'$.level\') AS level', 'mature_time']);
        $this->renderAjax(['data' => $data]);
    }

    public function actionAddFeedback()
    {
        $user_id = Cookie::getInstance()->getCookie('bhy_id')->value;
        if ($data = Feedback::getInstance()->addFeedback($user_id, $this->get)) {
            $this->renderAjax(['status' => 1, 'data' => $data, 'msg' => '举报成功']);
        } else {
            $this->renderAjax(['status' => 0, 'data' => [], 'msg' => '举报失败']);
        }
    }

    // 获取当前用户认证信息
    public function actionHonestyPhoto()
    {
        $user_id = isset($this->get['user_id']) ? $this->get['user_id'] : Cookie::getInstance()->getCookie('bhy_id')->value;
        $userInfo = UserInformation::getInstance()->getUserField($user_id, ['honesty_value']);
        if ($userInfo['honesty_value'] & 1) {
            $sfz = 1;
        } else {
            $sfz = UserPhoto::getInstance()->getPhotoList($user_id, 23, 2);
            if (count($sfz) == 2) {
                if ($sfz[0]['is_check'] == 1 && $sfz[1]['is_check'] == 1) {
                    $sfz = 1;
                    UserInformation::getInstance()->updateUserInfo($user_id, ['honesty_value' => ($userInfo['honesty_value'] + 1)]);
                } elseif ($sfz[0]['is_check'] == 0 || $sfz[1]['is_check'] == 0) {
                    $sfz = 0;
                } else {
                    $sfz = 2;
                }
            } else {
                $sfz = '';
            }
        }
        if (isset($this->get['user_id'])) {
            $this->renderAjax(['status' => 1, 'sfz' => $sfz, 'msg' => '获取成功']);
        } else {
            $marr = $userInfo['honesty_value'] & 2 ? 1 : $this->checkPhoto($user_id, 5, $userInfo['honesty_value']);
            $edu = $userInfo['honesty_value'] & 4 ? 1 : $this->checkPhoto($user_id, 4, $userInfo['honesty_value']);
            $housing = $userInfo['honesty_value'] & 8 ? 1 : $this->checkPhoto($user_id, 6, $userInfo['honesty_value']);
            $this->renderAjax(['status' => 1, 'sfz' => $sfz, 'marr' => $marr, 'edu' => $edu, 'housing' => $housing, 'msg' => '获取成功']);
        }
    }

    public function checkPhoto($user_id, $type, $honesty_value)
    {
        if ($data = UserPhoto::getInstance()->getPhotoList($user_id, $type, 1)) {
            if ($data[0]['is_check'] == 1) {
                if ($type == 5) {
                    $honesty_value = $honesty_value + 2;
                } elseif ($type == 4) {
                    $honesty_value = $honesty_value + 4;
                } elseif ($type == 6) {
                    $honesty_value = $honesty_value + 8;
                }
                UserInformation::getInstance()->updateUserInfo($user_id, ['honesty_value' => $honesty_value]);
                return 1;
            } elseif ($data[0]['is_check'] == 0) {
                return 0;
            } else {
                return 2;
            }
        } else {
            return '';
        }
    }

    /**
     * 退出登录
     */
    public function actionLoginOut()
    {
        $data = User::getInstance()->loginOut();
        $this->renderAjax(['status' => 1, 'data' => $data]);
    }
}
