/**
 * Created by Administrator on 2016/2/19.
 */
$(function(){
    $('.j-datatables').each(function () {
        var $this = $(this);
        var $filterContainer = $this.data('filter-container') ? $($this.data('filter-container')) : $(document);
        var filters = [];
        var table = $this.DataTable();
        $('.j-dt-filter', $filterContainer).each(function () {
            var $this = $(this);
            var type;
            if ($this.is('.j-dt-filter-range')) {
                type = 'range';
            } else if ($this.is('.j-dt-filter-group')) {
                type = 'group';
            } else if ($this.is('input[type=text]')) {
                type = 'text';
            } else if ($this.is('.select-like')) {
                type = 'selectLike';
            } else if ($this.is('select')) {
                type = 'select';
            } else if ($this.is('input[type=checkbox]')) {
                type = 'checkbox';
            } else if ($this.is('input[type=radio]')) {
                type = 'radio';
            }
            var f = new Filter($this, type, $filterContainer);
            f.table = table;
            filters.push(f);
            f.init(); // 初始化
        });

        var filterLength = filters.length;
        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {

            for (var i = 0; i < filterLength; i++) {
                if (!filters[i].search(settings, data, dataIndex)) {
                    return false;
                }
            }
            return true;
        });

    });
});








////////////////// Filter Start ////////////////////////
var Filter = function ($dom, type, $container) {
    this.$dom = $dom;
    this.type = type;
    this.table = null;
    this.col = null;
    this.$container = $container;
};
// 初始化,调用相应类型的init方法绑定事件
Filter.prototype.init = function () {
    if (this.table == null) {
        return true;
    }
    // 获取列序号
    if (this.col == null) {
        var col = this.$dom.data('col');
        if (parseInt(col, 10) == col) {
            this.col = col;
        } else {
            this.col = this.table.column(col).index();
            if (typeof this.col === 'undefined') {
                throw new Error('Cannot find col: "' + col + '"');
            }
        }
    }

    this[this.type + 'Init'].call(this);
};
// 搜索,调用相应类型search方法执行过滤
Filter.prototype.search = function (settings, data, dataIndex) {
    var method = this[this.type + 'Search'];
    return method ? method.call(this, settings, data, dataIndex) : true;
};
Filter.prototype.textInit = function () {
    var _this = this;
    var t = 0;
    this.$dom.on('keyup', function () {
        console.log(_this.$dom.val());
        if (t > 0) {
            clearTimeout(t);
        }
        t = setTimeout(function () {
            _this.table.column(_this.col).search(_this.$dom.val()).draw();
        }, 100);
    });
};
Filter.prototype.radioInit = function () {
    var _this = this;
    this.radioName = this.$dom.attr('name');
    this.$radioDom = this.$container.find('.j-dt-filter[name=' + this.radioName + ']');
    this.$dom.on('change', function () {
        var value;
        _this.$radioDom.each(function () {
            var $this = $(this);
            if ($this.prop('checked')) {
                value = $this.val();
            }
        });
        if (value) {
            _this.table.column(_this.col).search(value).draw();
        }
    });
};
Filter.prototype.checkboxInit = function () {
    // TODO
};
Filter.prototype.checkboxSearch = function () {
    // TODO
};
Filter.prototype.selectInit = function () {
    var _this = this;
    this.$dom.on('change', function () {
        var val = $.fn.dataTable.util.escapeRegex(
            _this.$dom.val()
        );
        console.log(_this.col);

        _this.table.column(_this.col).search(val ? '^' + val + '$' : '', true, false).draw();
    });
};
Filter.prototype.selectLikeInit = function () {

    var _this = this;
    this.$dom.on('change', function () {
        var val = $.fn.dataTable.util.escapeRegex(
            _this.$dom.val()
        );
        _this.table.column(_this.col)
            .search(val ? val : '', true, false).draw();
    })
};
Filter.prototype.rangeInit = function () {
    var _this = this;
    this.rangeType = this.$dom.data('range-type') == 'end' ? 'end' : 'start';
    this.rangeName = this.$dom.data('range-name');

    var otherRangeType = this.rangeType == 'end' ? 'start' : 'end';
    this.$rangeDom = this.$container
        .find('.j-dt-filter-range[data-range-name=' + this.rangeName + '][data-range-type=' + otherRangeType + ']');
    this.$dom.on('change', function () {
        _this.table.draw();
    });
};
Filter.prototype.rangeSearch = function (settings, data, dataIndex) {
    var vs = this.$dom.val();
    var ve = this.$rangeDom.val();
    if (this.rangeType == 'end') {
        var _v = vs;
        vs = ve;
        ve = _v;
    }

    var res = true;
    if (vs) {
        res = res && (data[this.col] >= vs);
    }
    if (ve) {
        res = res && (data[this.col] <= ve);
    }

    return res;
};
Filter.prototype.groupInit = function () {
    var _this = this;
    this.groupName = this.$dom.data('group-name');
    this.$groupDom = this.$container
        .find('.j-dt-filter-group[data-group-name=' + this.groupName + ']');
    this.groupSplit = this.$dom.data('group-split');

    this.$dom.on('change', function () {
        setTimeout(function () {
            _this.table.draw();
        });
    });
};
Filter.prototype.groupSearch = function (settings, data, dataIndex) {
    var group = [];
    this.$groupDom.each(function () {
        var $this = $(this);
        if ($this.is(':checked,:selected')) {
            group.push($this.val());
        }
    });

    if (group.length) {
        if (!data[this.col]) {
            return false;
        }
        var dataGroup = data[this.col].split(this.groupSplit);
        if (dataGroup.length < group.length) {
            return false;
        }

        dataGroup = dataGroup.join(this.groupSplit) + this.groupSplit;
        for (var i = 0, len = group.length; i < len; i++) {
            if (dataGroup.indexOf(group[i] + this.groupSplit) == -1) {
                return false;
            }
        }
    }

    return true
}