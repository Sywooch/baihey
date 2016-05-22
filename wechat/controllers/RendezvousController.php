<?php
namespace wechat\controllers;
use common\models\UserRendezvous;


/**
 * Site controller
 */
class RendezvousController extends BaseController
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

    /**
     * 发布约会
     */
    public function actionRelease(){
        $data = $this->get;
        $flag = UserRendezvous::getInstance()->release($data);
        $this->renderAjax(['status'=>1,'data'=>$flag]);
    }

    public function actionList(){

        $data = $this->get;
        $list = UserRendezvous::getInstance()->lists($data);
        $this->renderAjax(['status'=>1 , 'data'=>$list]);
    }
}
