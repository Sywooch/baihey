<div class="box border green">
    <div class="box-title">
        <h4><i class="fa fa-bars"></i>Form states</h4>
        <div class="tools hidden-xs">
            <a href="#box-config" data-toggle="modal" class="config">
                <i class="fa fa-cog"></i>
            </a>
            <a href="javascript:;" class="reload">
                <i class="fa fa-refresh"></i>
            </a>
            <a href="javascript:;" class="collapse">
                <i class="fa fa-chevron-up"></i>
            </a>
            <a href="javascript:;" class="remove">
                <i class="fa fa-times"></i>
            </a>
        </div>
    </div>
    <div class="box-body big">
        <form class="form-horizontal" role="form" action="create-permission" method="post">
            <div class="form-group">
                <label class="col-sm-3 control-label">权限名称</label>
                <div class="col-sm-9">
                    <input class="form-control" name="item" type="text" placeholder="请输入权限名称" value="">
                </div>
            </div>

            <div class="form-group has-error">
                <label class="col-sm-3 control-label"></label>
                <div class="col-sm-9">
                    <button type="submit" class="btn btn-success">保存</button>
                </div>
            </div>

        </form>


    </div>
</div>