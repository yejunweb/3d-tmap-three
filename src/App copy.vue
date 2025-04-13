<script setup>
import { onMounted } from 'vue'
// 引入Three.js
import * as THREE from 'three';
// 引入OrbitControls模块
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// 引入GLTFExporter
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
// 引入地图
import { TMapLoader } from './map/TMap.js';


async function initMap() {

  // const mapContainer = document.getElementById('mapContainer')
  // TMap = await TMapLoader('OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77')

  let center = new TMap.LatLng(39.905817, 116.375128, 0); // 设置中心点坐标

  // 初始化地图
  const map = new TMap.Map("mapContainer", {
    center: center,
    zoom: 19,
    pitch: 50,
    rotation: -20,
  });

  map.setBaseMap({
    type: "vector",
    features: ["base", "label", "point"],
    // features: ["base"],
  });

  // three.js自定义图层
  let glCustomLayer = null;
  // three.js
  let renderer = null;
  let camera = null;
  let scene = null;
  let group = null;
  let mapCamera = null; // 地图相机

  // three.js自定义图层
  glCustomLayer = new TMap.GLCustomLayer({
    id: "GlCus__GlCustomLayer",
    map: map,
    keepFps: false, // 是否保持恒定帧率渲染,当渲染存在动画时设置为true
    zIndex: 10,
    // visible: false,
    init: (gl) => {
      // 初始化THREE
      renderer = new THREE.WebGLRenderer({
        context: gl,
        antialias: true,
      });
      renderer.autoClear = false;
      renderer.outputEncoding = THREE.sRGBEncoding;

      // 创建THREE.js中的相机
      mapCamera = map.getCamera(); // 获取地图相机
      const { fovy, view, near, far, distance } = mapCamera;
      const aspect = (view.right - view.left) / (view.top - view.bottom);
      camera = new THREE.PerspectiveCamera(fovy, aspect, near, far);
      camera.position.z = distance;
      scene = new THREE.Scene();

      group = new THREE.Group();
      scene.add(group);

      // 添加环境光
      group.add(new THREE.AmbientLight(0xffffff, 3));


      // 设置坐标系
      const axesHelper = new THREE.AxesHelper(10000);
      scene.add(axesHelper);

      // 加载立方体
      // // THREE.js生成自定义模型 以立方体为例
      // const geometry = new THREE.BoxGeometry(200, 200, 200);
      // const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      // const cube = new THREE.Mesh(geometry, material);


      // 提供的经纬度点
      // const points = [
      //   { lat: 116.375128, lon: 39.905817 }, // 西北
      //   { lat: 116.375002, lon: 39.909899 }, // 东北
      //   { lat: 116.3752, lon: 39.905762 },  // 西南
      //   { lat: 116.3752, lon: 39.905762 }   // 东南
      // ];

      // 多个经纬度数据
      const pointsArr = [
        [
          { lat: 39.905817, lon: 116.375128 }, // 西北
          { lat: 39.909899, lon: 116.375002 }, // 东北
          { lat: 39.905762, lon: 116.3752 },  // 西南
          { lat: 39.905762, lon: 116.3752 }   // 东南
        ],
        [
          { lat: 39.906921, lon: 116.375415 }, // 西北
          { lat: 39.906901, lon: 116.376106 }, // 东北
          { lat: 39.906651, lon: 116.375427 },  // 西南
          { lat: 39.906638, lon: 116.376103 }   // 东南
        ]

      ]

      for (let points of pointsArr) {

        // 计算立方体参数
        const { center1, size } = calculateCubeParameters(points);
        console.log(size * 120000, size * 10000)
        // 创建立方体
        let geometry1 = new THREE.BoxGeometry(size * 12000000, size * 1000000, 150);
        // geometry1 = new THREE.BoxGeometry(200,200,200);
        let geometry4 = new THREE.BoxGeometry(size * 12000000, size * 1000000, 50);
        // 纹理
        // 前面
        const textureFront = new THREE.TextureLoader().load(new URL('./assets/textures/front.png', import.meta.url));
        // 后面
        const textureBack = new THREE.TextureLoader().load(new URL('./assets/textures/back.png', import.meta.url));
        // 上面
        const textureTop = new THREE.TextureLoader().load(new URL('./assets/textures/top.png', import.meta.url));
        // 上背面
        const textureTopBack = new THREE.TextureLoader().load(new URL('./assets/textures/top_back.png', import.meta.url));
        // 侧面
        const textureSide = new THREE.TextureLoader().load(new URL('./assets/textures/side.png', import.meta.url));

        // let layers = [];
        let len = 9;
        let cube = new THREE.Group();

        for (let i = 0; i < len; i++) {
          let material = [
            // 右面
            new THREE.MeshBasicMaterial({ map: textureSide }),
            // 左面
            new THREE.MeshBasicMaterial({ map: textureSide }),
            // 上面
            new THREE.MeshBasicMaterial({ color: 0xffffff }),
            // 下面
            new THREE.MeshBasicMaterial({ color: 0xffffff }),
            // 前面
            new THREE.MeshBasicMaterial({ map: textureFront }),
            // 后面
            new THREE.MeshBasicMaterial({ map: textureBack })]; // 红色材质
          let layer = new THREE.Mesh(geometry1, material);
          layer.position.y = i * size * 1000000;
          if (i == len - 1) {
            material = [
              // 右面
              new THREE.MeshBasicMaterial({ color: 0xffffff }),
              // 左面
              new THREE.MeshBasicMaterial({ color: 0xffffff }),
              // 上面
              new THREE.MeshBasicMaterial({ color: 0xffffff }),
              // 下面
              new THREE.MeshBasicMaterial({ color: 0xffffff }),
              // 前面
              new THREE.MeshBasicMaterial({ map: textureTop }),
              // 后面
              new THREE.MeshBasicMaterial({ map: textureTopBack })]; // 红色材质

            layer = new THREE.Mesh(geometry4, material);

            layer.position.y = i * 100;
            layer.position.z = 50;
          }
          // layers.push(layer)
          cube.add(layer);
        }


        // 设置立方体位置
        // cube.position.copy(center1);

        // 将立方体底部朝向地球中心
        cube.lookAt(scene.position);
        cube.rotateX(Math.PI / 2); // 调整方向

        // 添加立方体到场景
        scene.add(cube);

        // 创建控制器
        const controls = new OrbitControls(camera, renderer.domElement);

        // 添加控制器到场景
        scene.add(controls);
        console.log(center1, 1111111)

        // 计算中心坐标点
        let c = calculateCentroid(points[0].lat, points[0].lon, points[1].lat, points[1].lon, points[2].lat, points[2].lon, points[3].lat, points[3].lon)
        console.log(c, 'ccccccccc')
        const position = new TMap.LatLng(c.lat, c.lon, 0);
        console.log(position, 2222222)
        // 坐标转换 经纬度转THREE中的世界坐标
        const coord = map.glLatLngToPosition(position);
        cube.position.set(coord.x, coord.y, coord.z);

        // 用group添加
        group.add(cube);
      }



      // 需将构建的Three相关项返回
      return { renderer, camera, scene, group };
    },
    render: () => {
      renderer.render(scene, camera);
    },
  });
}

// dom加载完成后执行
onMounted(() => {
  initMap()
})



// 定义地球半径（近似值）
// const EARTH_RADIUS = 6371; // 单位：千米
const EARTH_RADIUS = 1; // 单位：千米

// 将经纬度转换为3D空间坐标
function latLonToVector3(lat, lon) {
  // 将经纬度转换为弧度
  const latRadians = lat * (Math.PI / 180);
  const lonRadians = lon * (Math.PI / 180);

  // 计算XYZ坐标
  const x = EARTH_RADIUS * Math.cos(latRadians) * Math.cos(lonRadians);
  const y = EARTH_RADIUS * Math.cos(latRadians) * Math.sin(lonRadians);
  const z = EARTH_RADIUS * Math.sin(latRadians);

  return new THREE.Vector3(x, y, z);
}

// 根据四个点计算立方体的中心位置和尺寸
function calculateCubeParameters(points) {
  const center = new THREE.Vector3();
  let maxDistance = 0;

  for (let i = 0; i < points.length; i++) {
    const p = latLonToVector3(points[i].lat, points[i].lon, EARTH_RADIUS);
    console.log(p, 'ppppppp');
    // if(i == 0){
    center.add(p);
    // }

  }
  center.divideScalar(4); // 计算中心点

  console.log(center, 'centercentercentercenter');

  for (let i = 0; i < points.length; i++) {
    const p = latLonToVector3(points[i].lat, points[i].lon, EARTH_RADIUS);
    const distance = p.distanceTo(center);
    maxDistance = Math.max(maxDistance, distance);
  }

  return { center, size: maxDistance * 2 };
}

// 计算多边形的重心
function calculateCentroid(lat1, lon1, lat2, lon2, lat3, lon3, lat4, lon4) {
  // 将经纬度转换为弧度
  function toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  // 将弧度转换回经纬度
  function toDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  // 计算重心的经纬度（以弧度为单位）
  var lat = (toRadians(lat1) + toRadians(lat2) + toRadians(lat3) + toRadians(lat4)) / 4;
  var lon = (toRadians(lon1) + toRadians(lon2) + toRadians(lon3) + toRadians(lon4)) / 4;

  // 将重心坐标转换回度
  var centroidLat = toDegrees(lat);
  var centroidLon = toDegrees(lon);

  // 返回重心坐标
  return { lat: centroidLat, lon: centroidLon };
}

// 根据4个经纬度坐标 计算多边形的中心



// 监听窗口大小变化，以调整渲染器大小
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


</script>

<template>
  <div id="mapContainer"></div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}

#mapContainer {
  position: relative;
  width: 100%;
  height: 100%;
}

/* canvas {
  display: block;
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
} */
</style>
