/*
*上传图片并本地预览插件
*兼容IE8
*obj    ----上传图片容器
*picNum ----上传图片的张数
*width  ----图片宽度
*height ----图片宽度
 */
(function ($) {
    // 构造函数
    var successfun = null

    function UploadImg(obj, opt) {
        this.obj = obj;
        this.$obj = $(obj);
        if (opt.picStyle == 0) {
            this.defaultOpt = {
                "picStyle": 0,
                "picNum": 1,
                "width": 200,
                "height": 200
            };
            this.options = $.extend({}, this.defaultOpt, opt);
        }
        if (opt.picStyle == 1) {
            //如果用户选择了自定义样式，但又没有选择宽度及高度，则会采用默认宽高
            this.defaultOpt = {
                "picStyle": 1,
                "picNum": 1,
                "width": 200,
                "height": 200,
                "realWidth": 200,
                "realHeight": 200
            };
            // this.num = 0;//计算上传图片个数
            this.options = $.extend({}, this.defaultOpt, opt);
        }
        UploadImg[this.options.classname + 'successfun'] = this.options.success
        this.init();

    };
// 初始化html
    UploadImg.prototype.init = function () {
        // var html = '<input type="file" class="fileInput" id="file" >'
        // 			+'<div class="previewBox" id="previewBox" style="position: absolute; z-index:-1; width: '+this.options.maxwidth+'; height: '+this.options.maxheight+';" ><img id="uploadImg" src="uploadImg.jpg"  width='+ this.options.width +' height='+ this.options.height +'></div>';
        var html = '<input type="file" name="multipartFile" class="' + this.options.classname + '" id="file" >'
            + '<div class="' + this.options.prevclass + '" id="previewBox" style="position: absolute; display: inline-block; z-index:1;max-width: ' + this.options.maxwidth + '; max-height: ' + this.options.maxheight + ';" ><img id="uploadImg" src="static/image/uploadImg.png"  width=' + this.options.width + ' height=' + this.options.height + '>';
        // +'<div class="picBox" id="picBox"><img id="uploadImg" src="uploadImg.png"></div>';
        this.$obj.append($(html));
        this.bindEvent(this.options.classname);
    }
//绑定事件
    UploadImg.prototype.bindEvent = function (classname) {
        var self = this;
        this.$obj.on("click.choose", "." + this.options.prevclass, function () {
            $("." + classname).trigger("click");
        });
        $("." + classname).on("change.upload", function () {
            self.operationImg(this);
        });
        this.$obj.off(".choose,.upload");
    }
    //检查图片宽高
    UploadImg.prototype.testWidthHeight = function (width, height) {
        debugger;
        //如果picStyle是0，则只能按照指定大小进行裁剪图片
        if (this.options.picStyle == 0) {
            if (width === this.options.width && height === this.options.height) {
                alert("选择的图片刚刚好");
                return true;
            } else {
                alert("您选择的图片宽高不符合要求，请选择宽" + this.options.width + "px*高" + this.options.height + "px的图片");
                return false;
            }
        }
        if (this.options.picStyle == 1) {
            //计算上传图片与原本图片框的比例
            debugger;
            var heightScale = height / this.options.height;
            var widthScale = width / this.options.width;
            if (heightScale > widthScale) {
                this.options.realWidth = width / heightScale;
                this.options.realHeight = this.options.height;
            } else {
                this.options.realHeight = height / widthScale;
                this.options.realWidth = this.options.width;
            }
            return true;
        }
    }

    UploadImg.prototype.testWidthHeightIE = function (DomElement) {
        var img = new Image();
        img.src = document.getElementById('file').value;
        width = img.width;
        height = img.height;
    }
    //检查图片格式
    UploadImg.prototype.isImg = function (url) {
        var result = /.+\.(jpg|JPG|png|PNG|jpeg|JPEG|gif|GIF)$/.test(url);
        if (!result) {
            $.showAlert({title: "操作失败", body: "您选择的图片格式有误，请重新选择"});
            return false;
        } else {
            return true;
        }
    },
        //添加预览图片到页面上
        UploadImg.prototype.addImgHtml = function (url) {
            //可以上传多张图片
            // if(this.options.picNum == 1) {
            // 	if($(".previewBox")) {
            // 		$(".previewBox").html("<img src="+ url +" width="+ this.options.width +" height="+ this.options.height +">");
            // 	}
            // } else {
            // 	if($(".previewBox") && this.num < this.options.picNum) {
            // 		$(".previewBox").append("<img src="+ url +" width="+ this.options.width +" height="+ this.options.height +">");
            // 		this.num++;
            // 	}
            // }
            if ($("." + this.options.prevclass)) {
                $("." + this.options.prevclass).html("<img src=" + url + " width=" + this.options.realWidth + " height=" + this.options.realHeight + ">");
            }
        },
        //兼容IE处理 填充
        UploadImg.prototype.previewImgIE = function (obj) {
            obj.select();
            $(obj).blur();
            if (document.selection) {
                var url = document.selection.createRange().text;
                if (this.isImg(url)) {
                    var imgWrap = "<div class='imgWrap' id='img'></div>";
                    if (this.options.picNum == 1) {
                        $("." + this.options.prevclass).html($(imgWrap));
                    } else if (this.options.picNum > 1 && this.num < this.options.picNum) {
                        $("." + this.options.prevclass).append($(imgWrap));
                        this.num++;
                    } else {
                        return;
                    }
                    ;
                    $(".imgWrap").css({
                        "width": this.options.width,
                        "height": this.options.height,
                        "display": "inline-block",
                        "margin-right": "10px",
                        "*display": "inline",
                        "*zoom": 1
                    });
                    $(".imgWrap:last").css("filter", "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod = scale,src=\"" + url + "\")");
                    this.testWidthHeightIE(document.getElementById("file"));
                }
            }
        },
        //正常处理 不填充
        UploadImg.prototype.previewImg = function (obj) {
            debugger;
            var file = obj.files[0];
            var self = this;
            if (this.isImg(file.name)) {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    var data = evt.target.result;
                    var image = new Image();
                    image.onload = function () {
                        // var width =image.width;
                        // var height=image.height;
                        // if(width===300 &&height===300){
                        // 	alert("选择的照片刚刚好");
                        // }else{
                        // 	alert("您选择的图片宽高不符合要求，请选择宽300px*高300px的图片");
                        // }
                        if (self.testWidthHeight(image.width, image.height)) {
                            self.addImgHtml(evt.target.result);
                            $("#uploadImg").css("display", "block");
                        }
                    }
                    image.src = data;
                };
                reader.readAsDataURL(file);

            } else {
                alert("您输入的图片格式有误，请重新输入");
                return false;
            }
        };
    //上传图片操作
    UploadImg.prototype.operationImg = function (fileObj) {
        if (fileObj.files && fileObj.files[0]) {
            var dic = new FormData();
            dic.append('file', fileObj.files[0]);

            if (fileObj.files[0].size / (1024 * 1024) > 1) {
                $.showAlert({title: "操作失败", body: "照片大小不要超过1M"});
                return;
            }

            var self = this;
            $.ajax({
                url: baseUrl + '/nps/upload', type: 'POST', data: dic, processData: false,
                contentType: false,
                dataType: 'JSON',
                headers: {
                    token: localStorage.getItem('token')
                },
                success: function (res) {
                    if (res.msg == "success") {
                        UploadImg[self.options.classname + 'successfun'](res)
                        self.previewImg(fileObj);
                    } else {
                        $.showAlert({title: "操作失败", body: res.msg});
                    }
                }
            })
        }
    }
    //绑定插件
    $.fn.uploadImg = function (options) {
        return this.each(function () {
            new UploadImg(this, options);
        });
    }
})(jQuery);