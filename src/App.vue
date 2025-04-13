<script setup>
import { onMounted } from "vue";
// 引入Three.js
import * as THREE from "three";
// 引入OrbitControls模块
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 引入GLTFExporter
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
// 引入地图
import { TMapLoader } from "./map/TMap.js";

async function initMap() {
  // const mapContainer = document.getElementById('mapContainer')
  // TMap = await TMapLoader('OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77')

  let center = new TMap.LatLng(31.839254, 117.099784, 0); // 设置中心点坐标
  console.log("center: ", center);

  // 初始化地图
  const map = new TMap.Map("mapContainer", {
    center: center,
    zoom: 19,
    pitch: 50,
    rotation: -20,
  });

  map.setBaseMap({
    type: "vector",
    // features: ["base", "label", "point"],
    features: ["base"],
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

      // 四个地理经纬度坐标点
      const coordsArr = [
        // [
        //   { lat: 31.839254, lon: 117.099784 }, // 西北
        //   { lat: 31.839392, lon: 117.099784 }, // 东北
        //   { lat: 31.839254, lon: 117.099433 }, // 西南
        //   { lat: 31.839392, lon: 117.099433 }, // 东南（重复的坐标，这里应该是另一个坐标）
        // ],
        [
          { lat: 31.839254, lon: 117.099433 }, // 西南
          { lat: 31.839392, lon: 117.099433 }, // 东南（重复的坐标，这里应该是另一个坐标）
          { lat: 31.839254, lon: 117.099784 }, // 西北
          { lat: 31.839392, lon: 117.099784 }, // 东北
        ],
        [
          { lat: 31.839246, lon: 117.099295 }, // 西北
          { lat: 31.839392, lon: 117.099295 }, // 东北
          { lat: 31.839246, lon: 117.098867 }, // 西南
          { lat: 31.839392, lon: 117.098867 }, // 东南（重复的坐标，这里应该是另一个坐标）
        ],
        [
          { lat: 31.838035, lon: 117.104942 }, // 西北
          { lat: 31.838189, lon: 117.104942 }, // 东北
          { lat: 31.838035, lon: 117.104174 }, // 西南
          { lat: 31.838189, lon: 117.104174 }, // 东南（重复的坐标，这里应该是另一个坐标）
        ],
      ];

      coordsArr.forEach((coords) => createCube(coords, scene, group, map));

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
  initMap();
});

// 将经纬度转换为Three.js右手坐标系的Vector3
function latLonToThreeJS(lat, lon) {
  const phi = (lon * Math.PI) / 180 - Math.PI / 2; // 经度转换为弧度，中心对齐
  const theta = ((90 - lat) * Math.PI) / 180; // 纬度转换为弧度

  const x = 50 * Math.cos(theta) * Math.sin(phi); // 假设深度为10
  const y = 50 * Math.sin(theta);
  const z = 50 * Math.cos(theta) * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

function createCube(coords, scene, group, map) {
  // 计算中心点
  const bounds = calculateBounds(coords);
  const centerCoord = calculateCenterBounds(bounds);

  // 转换坐标并计算边界
  const vectors = coords.map((e) => latLonToThreeJS(e.lat, e.lon));

  // 计算宽度、高度和深度
  const width =
    Math.max(...vectors.map((v) => v.x)) - Math.min(...vectors.map((v) => v.x));
  const height =
    Math.max(...vectors.map((v) => v.y)) - Math.min(...vectors.map((v) => v.y));
  const depth = 50; // 假设的深度

  console.log(width, height, "widthwidthwidthwidthwidth");

  // 创建立方体几何形状
  let geometry = new THREE.BoxGeometry(
    width * 1000000,
    height * 1000000,
    depth
  );

  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  // 立方体纹理贴图
  // 前面
  const textureFront = new THREE.TextureLoader().load(
    new URL("./assets/textures/front.png", import.meta.url)
  );
  textureFront.flipY = false;
  // 后面
  const textureBack = new THREE.TextureLoader().load(
    new URL("./assets/textures/back.png", import.meta.url)
  );
  textureBack.flipY = false;
  // 上面
  const textureTop = new THREE.TextureLoader().load(
    new URL("./assets/textures/top.png", import.meta.url)
  );
  textureTop.flipY = false;

  // 上背面
  const textureTopBack = new THREE.TextureLoader().load(
    new URL("./assets/textures/top_back.png", import.meta.url)
  );
  textureTopBack.flipY = false;
  // 侧面
  const textureSide = new THREE.TextureLoader().load(
    new URL("./assets/textures/side.png", import.meta.url)
  );
  textureSide.flipY = false;

  let len = 9;
  let cube = new THREE.Group();

  for (let i = 0; i < len; i++) {
    let material = [
      // 右面
      new THREE.MeshBasicMaterial({ map: textureSide }),
      // 左面
      new THREE.MeshBasicMaterial({ map: textureSide }),
      // 前面
      new THREE.MeshBasicMaterial({ map: textureFront }),
      // 后面
      new THREE.MeshBasicMaterial({ map: textureBack }),
      // 上
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      // 下面
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    ]; // 红色材质
    let layer = new THREE.Mesh(geometry, material);
    layer.position.z = i * depth;
    if (i == len - 1) {
      material = [
        // 右面
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        // 左面
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        // 前面
        new THREE.MeshBasicMaterial({ map: textureTop }),
        // 后面
        new THREE.MeshBasicMaterial({ map: textureTopBack }),
        // 上面
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        // 下面
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
      ]; // 红色材质

      layer = new THREE.Mesh(
        new THREE.BoxGeometry(width * 1000000, height * 1000000, depth),
        material
      );

      // layer.position.y = i * 100;
      // layer.position.z = 50;
    }

    layer.position.z = i * depth;
    // }
    // layers.push(layer)
    cube.add(layer);
  }

  // const cube = new THREE.Mesh(geometry, material);
  // 将立方体底部朝向地球中心
  cube.lookAt(scene.position);
  cube.rotateZ(Math.PI); // 调整方向
  scene.add(cube);

  // 设置相机位置
  //   camera.position.z = 50;

  // 加载立方体
  // THREE.js生成自定义模型 以立方体为例
  //   const geometry = new THREE.BoxGeometry(200, 200, 200);
  //   const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  //   const cube = new THREE.Mesh(geometry, material);
  //   const position = center;
  const position = new TMap.LatLng(centerCoord.lat, centerCoord.lon, 0); // 设置中心点坐标
  // 坐标转换 经纬度转THREE中的世界坐标
  const coord = map.glLatLngToPosition(position);
  cube.position.set(coord.x, coord.y, coord.z);

  // 用group添加
  group.add(cube);
}

// 计算经纬度的边界
function calculateBounds(coords) {
  const lats = coords.map((coord) => coord.lat);
  const lons = coords.map((coord) => coord.lon);

  return {
    maxLat: Math.max(...lats),
    minLat: Math.min(...lats),
    maxLon: Math.max(...lons),
    minLon: Math.min(...lons),
  };
}

// 计算中心经纬度
function calculateCenterBounds(bounds) {
  const centerLat = (bounds.maxLat + bounds.minLat) / 2;
  const centerLon = (bounds.maxLon + bounds.minLon) / 2;

  return { lat: centerLat, lon: centerLon };
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
