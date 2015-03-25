(function() {
    //根据路径加载图片,并生成缩略图
    function getImage(url,callback) {
        var img = document.createElement('img');
        img.width = 8;
        img.height = 8;
        img.src = url;
        img.onload = function() {
            callback && callback(this);
        };
    }

    //获取图片像素数据
    function getImageData(url,callback) {
        getImage(url,function(img) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, img.width, img.height);
            var imageData = context.getImageData(0, 0, img.width, img.height);
            callback(imageData);
        })
    }

    //图像灰度处理
    function grayScale(imageData) {
        var d = imageData.data;

        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i + 1];
            var b = d[i + 2];
            d[i] = d[i + 1] = d[i + 2] = (r+g+b)/3;
        }
    };

    //计算所有像素的灰度平均值
    function average(pixels) {
        var m = 0;
        for (var i = 0; i < pixels.length; ++i) {
            m += pixels[i];
        }
        m = m / pixels.length;
        return m;
    }

    //比较像素的灰度
    function compareAverage(pixels,avgPixel) {
        for (var i = 0; i < pixels.length; i++) {
            if (pixels[i] >= avgPixel) {
                pixels[i] = 1;
            } else {
                pixels[i] = 0;
            }
        }
    }

    //计算哈希值
    function imgHash(pixels) {
        var hashCode = '';
        for (var i = 0; i < pixels.length; i += 4) {
            var result = pixels[i]*Math.pow(2, 3) +
                pixels[i + 1]*Math.pow(2, 2) +
                pixels[i + 2]*Math.pow(2, 1) +
                pixels[i + 3];
            hashCode += binaryToHex(result);
        }
        return hashCode;
    }

    //二进制转为十六进制
    function binaryToHex(binary) {
        var ch = '';
        switch (binary) {
            case 0:
                ch = '0';
                break;
            case 1:
                ch = '1';
                break;
            case 2:
                ch = '2';
                break;
            case 3:
                ch = '3';
                break;
            case 4:
                ch = '4';
                break;
            case 5:
                ch = '5';
                break;
            case 6:
                ch = '6';
                break;
            case 7:
                ch = '7';
                break;
            case 8:
                ch = '8';
                break;
            case 9:
                ch = '9';
                break;
            case 10:
                ch = 'a';
                break;
            case 11:
                ch = 'b';
                break;
            case 12:
                ch = 'c';
                break;
            case 13:
                ch = 'd';
                break;
            case 14:
                ch = 'e';
                break;
            case 15:
                ch = 'f';
                break;
            default:
                ch = ' ';
        }
        return ch;
    }


    //获取图片指纹
    function getImageFinger(url,callback) {
        getImageData(url,function(imageData) {
            grayScale(imageData);
            var avgPixel = average(imageData.data);
            compareAverage(imageData.data, avgPixel);
            var hashCode = imgHash(imageData.data);
            callback(hashCode);
        })

    }


    //比较两个图片的指纹,得到汉明距离
    function getTwoImgHanMing(sourceImgUrl,goalImgUrl,callback) {
        var ep = new EventProxy();

        getImageFinger(sourceImgUrl,function(hashCode) {
            ep.emit('source', hashCode);
        })

        getImageFinger(goalImgUrl,function(hashCode) {
            ep.emit('goal', hashCode);
        })

        ep.all('source','goal',function(sourceHashCode,goalHashCode) {
            var difference = 0;
            var len = sourceHashCode.length;
            for (var i = 0; i < len; i++) {
                if (sourceHashCode.charAt(i) != goalHashCode.charAt(i)) {
                    difference++;
                }
            }
            callback(difference);
        });
    }

    this.getTwoImgHanMing = getTwoImgHanMing;
})()
