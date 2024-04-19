<template>
  <div id="container"></div>
</template>

<script>
import {getPos,getLat } from "@/utils/commond";
import AMapLoader from '@amap/amap-jsapi-loader';
export default {
  data() {
    return {
      point: {},
      map:null,
      marker:null,
      timer:null
    };
  },
  props: {
    lng: "", //经
    lat: "" //wei
  },
  watch: {
    lng() {
      this.mapInit(); //处理三级弹窗不更新问题，没必要可以去掉
    },
    point: {
      handler() {
        this.mapInit();
      },
      deep: true
    }
  },
  mounted() {
    this.mapInit();
    // getPos('广东省广州市天河区龙洞步行街').then(res=>{
    //   console.log(res);
    //   getLat('39.984154,116.307490').then(res=>{
    //   console.log(res);
    // })
    // })
  },
  methods: {
    mapInit() {
        //初始化地图
      // 高德地图
      let that =this
      let center =[116.397128,39.916527]
          if (this.lng) {
          center =[this.lng,this.lat]
        }
        AMapLoader.load({
      key:"82d94d6a59eceae72dce5f3802c4fc0c",             // 申请好的Web端开发者Key，首次调用 load 时必填
      version:"2.0",      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins:['AMap.Geocoder'],       // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    }).then((AMap)=>{
      this.map = new AMap.Map("container",{  //设置地图容器id
        viewMode:"2D",    //是否为3D地图模式
        zoom:10,           //初始化地图级别
        center:center, //初始化地图中心点位置
        // resizeEnable:true,
      });
      this.marker = new AMap.Marker({
        position: center,
        map: this.map
    });
    this.map.add(this.marker);
    this.map.on('click', (e)=>{
      console.log(e.lnglat.lat);
      var position = e.lnglat;
      this.map.setCenter(position); 
      this.map.remove(this.marker)
      this.marker = new AMap.Marker({
        position: position,
        map: this.map
      });
      this.map.add(this.marker);
      var geocoder = new AMap.Geocoder({ city: '全国'})
        var lat = e.lnglat.lat.toFixed(6);
      var lng = e.lnglat.lng.toFixed(6);
      geocoder.getAddress(position,(status, result)=>{
        console.log(status, result);
        if (status === 'complete'&&result.regeocode) {
          let addressComponents=result.regeocode.addressComponent
          this.$emit("detailedAddress", {point:{lat,lng},addressComponents:{...addressComponents,city:addressComponents.city?addressComponents.city:addressComponents.province}});
        }
      })
      
    });
    }).catch(e=>{
      console.log(e);
    })
    
        // 腾讯地图
    //     let that=this
    //     let center =new qq.maps.LatLng(39.916527,116.397128)
    //     if (this.lng) {
    //       center =new qq.maps.LatLng(this.lat,this.lng)
    //     }
    //   this.map = new qq.maps.Map(document.getElementById("container"),{
    //     center: center,
    //     zoom: 10
    // });
    // this.marker = new qq.maps.Marker({
    //     position: center,
    //     map: this.map
    // });
    // qq.maps.event.addListener(this.map, 'click',(e)=>{
    //   console.log('点击',e);
    //   var lat = e.latLng.getLat().toFixed(6);
    //   var lng = e.latLng.getLng().toFixed(6);
    //   that.map.panTo(new qq.maps.LatLng(lat, lng))
    //   that.marker.setPosition(e.latLng)
    //   getLat(`${lat},${lng}`).then(res=>{
    //   this.$emit("detailedAddress", {point:{lat,lng},addressComponents:{...res.result.address_component,streetNumber:res.result.address_component.street_number}});
    // })
    // })

    // 百度地图
      // if (this.lng) {
      //   // 根据金纬度定位
      //   var map = new BMap.Map("container");
      //   map.clearOverlays();
      //   var new_point = new BMap.Point(this.lng, this.lat);
      //   map.centerAndZoom(new_point, 10);
      //   var marker = new BMap.Marker(new_point); // 创建标注
      //   map.addOverlay(marker); // 将标注添加到地图中
      //   map.panTo(new_point);
      // } else {
      //   var map = new BMap.Map("container"); // 创建Map实例
      //   map.centerAndZoom("武汉市", 12); // 初始化地图,设置中心点坐标和地图级别
      // }

      // map.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放

      // map.addEventListener("click", e => {
      //   var point = new BMap.Point(e.point.lng, e.point.lat);
        //清除地图上所有的覆盖物
        // map.clearOverlays();
        // var pt = e.point;
        // var marker = new BMap.Marker(new BMap.Point(pt.lng, pt.lat));
        // map.addOverlay(marker);
        // var geoc = new BMap.Geocoder();
        // geoc.getLocation(pt, rs => {
        //   //  this.lng = rs.point.lng;
        //   //  this.lat = rs.point.lat;
        //   // var addComp = rs.addressComponents;
        //   let detailedAddress = rs.address; //基本详细地址
        //   // console.log(addComp) //详细地址
        //   // let dizhi = addComp.province + ',' + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber;
        //   // console.log(dizhi)
        //   // 创建窗口信息
        //   var opts = {
        //     width: 200,
        //     height: 50
        //   };
        //   var infoWindow = new BMap.InfoWindow(detailedAddress, opts); // 创建信息窗口对象
        //   map.openInfoWindow(infoWindow, point); //开启信息窗口
        //   this.$emit("detailedAddress", rs);
        // });
      // });
    },
    // 获取经纬度
    getLngAndLat(address) {
      clearTimeout(this.timer)
      this.timer=setTimeout(()=>{
        let that =this
      console.log(address);
      var geocoder = new AMap.Geocoder({ city: '全国'})
      geocoder.getLocation(address,(status, result)=>{
        console.log(status, result);
        if (status === 'complete'&&result.geocodes) {
          let location=result.geocodes[0].location
          console.log(location.lng,location.lat);
          var position = new AMap.LngLat(location.lng, location.lat);
            this.map.setCenter(position); 
            this.map.remove(this.marker)
            this.marker = new AMap.Marker({
              position: position,
              map: this.map
          });
            this.$nextTick(()=>{
              this.map.add(this.marker);
              that.$emit("point", {lng:location.lng,lat:location.lat});
            })
        }
      })
      },300)
      // getPos(address).then(res=>{
      //   console.log('触发',res);
      //   if(res.status===0){
      //     let latLng=res.result.location
      //     let pos=new qq.maps.LatLng(latLng.lat, latLng.lng)
      //     this.map.panTo(pos)
      //     this.marker.setPosition(pos)
      //     this.$emit("point", latLng);
      //   }
      // })
      // var map = new BMap.Map("container");
      // //创建地址解析器实例
      // var myGeo = new BMap.Geocoder();
      // let that = this;
      // map.clearOverlays();
      // // 将地址解析结果显示在地图上，并调整地图视野
      // myGeo.getPoint(
      //   address,
      //   function(point) {
      //     if (point) {
      //       // console.log("地址", point);
      //       that.point = point;
      //       that.$emit("point", point);
      //     } else {
      //       alert("您选择的地址没有解析到结果！");
      //     }
      //   },
      //   address
      // );
      // map.centerAndZoom(address, 10);
      // // 创建窗口信息
      // var opts = {
      //   width: 200,
      //   height: 50
      // };
      // var infoWindow = new BMap.InfoWindow(address, opts); // 创建信息窗口对象
      // map.openInfoWindow(infoWindow, this.point); //开启信息窗口
      // map.addOverlay(new BMap.Marker(this.point, { title: address }));
      // map.enableScrollWheelZoom(true);
      // map.panTo(this.point);
    }
  }
};
</script>

<style lang="scss" scoped>
#container {
  // overflow: hidden;
  width: 100%;
  height: 300px;
  margin: 0;
  font-family: "微软雅黑";
}
/deep/ .BMap_cpyCtrl {
  display: none !important;
}
/deep/ .anchorBL {
  display: none !important;
}
</style>
