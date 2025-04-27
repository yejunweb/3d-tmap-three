<script setup>
import { onMounted } from 'vue';
// 引入Three.js
import * as THREE from 'three';
// 引入OrbitControls模块
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// 引入GLTFExporter
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
// 引入地图
import { TMapLoader } from './map/TMap.js';

const cityInfo = {
    id: 1,
    areaId: 3401,
    name: '合肥市',
    latlon: [117.30949, 31.85797],
    automaticPositioning: true,
    vipVersion: 1,
};

const polygon = {
    type: 'Polygon',
    coordinates: [
        [
            // [117.4794277, 31.8776295],
            // [117.4794453, 31.8775292],
            // [117.4797979, 31.8775839],
            // [117.4797811, 31.8776724],
            // [117.4794277, 31.8776295],
            [117.4794652, 31.8775575],
            [117.4795802, 31.8775929],
            [117.4796222, 31.8775396],
            [117.4797135, 31.8775792],
            [117.4796724, 31.8776258],
            [117.4797811, 31.8776724],
            [117.4797501, 31.8777186],
            [117.479648, 31.8776877],
            [117.4794098, 31.8776113],
            [117.4794652, 31.8775575],
        ],
    ],
};

let map;

async function initMap() {
    // const mapContainer = document.getElementById('mapContainer')
    // TMap = await TMapLoader('OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77')

    let center = new TMap.LatLng(cityInfo.latlon[1], cityInfo.latlon[0]); // 设置中心点坐标
    console.log('center: ', center);

    // 初始化地图
    map = new TMap.Map('mapContainer', {
        center: center,
        zoom: 20,
        pitch: 50,
        rotation: -20,
    });
    map.setCenter({
        lat: 31.877600800000003,
        lng: 117.4796128,
        height: 0,
    });

    map.setBaseMap({
        type: 'vector',
        // features: ["base", "label", "point"],
        features: ['base'],
    });

    const startPoint = new TMap.LatLng(31.8776295, 117.4794277, 0);
    const endPoint = new TMap.LatLng(31.8775292, 117.4794453, 0);
    // const startPoint = new TMap.LatLng(31.8775575, 117.4794652, 0);
    // const endPoint = new TMap.LatLng(31.8775929, 117.4795802, 0);
    console.log('TMap distance: ', TMap.geometry.computeDistance([startPoint, endPoint]));

    const aaa = map.glLatLngToPosition(startPoint);
    const bbb = map.glLatLngToPosition(endPoint);
    const startPos = new THREE.Vector3(aaa.x, aaa.y, aaa.z);
    const endPos = new THREE.Vector3(bbb.x, bbb.y, bbb.z);
    console.log('THREE distance: : ', startPos.distanceTo(endPos));

    const ratio = startPos.distanceTo(endPos) / TMap.geometry.computeDistance([startPoint, endPoint]);
    console.log('ratio（THREE / TMap[m]）: ', ratio);

    // three.js自定义图层
    let glCustomLayer = null;
    // three.js
    let editor = null;
    let renderer = null;
    let camera = null;
    let scene = null;
    let group = null;
    let mapCamera = null; // 地图相机

    // three.js自定义图层
    glCustomLayer = new TMap.GLCustomLayer({
        id: 'GlCus__GlCustomLayer',
        map: map,
        keepFps: true, // 是否保持恒定帧率渲染,当渲染存在动画时设置为true
        zIndex: 10,
        // visible: false,
        init: gl => {
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
                // [
                //     ...[
                //         [117.4794277, 31.8776295],
                //         [117.4794453, 31.8775292],
                //         [117.4797979, 31.8775839],
                //         [117.4797811, 31.8776724],
                //     ].map(v => ({ lat: v[1], lon: v[0] })),
                // ],
            ];

            coordsArr.forEach(coords => createCube(coords, scene, group, map));
            createBuildings(polygon); // 绘制建筑物

            // 需将构建的Three相关项返回
            return { renderer, camera, scene, group };
        },
        render: () => {
            // 更新所有建筑模型位置
            group.children.forEach(child => {
                if (child.userData.originalPoints) {
                    const points = child.userData.originalPoints.map(item => {
                        const LatLng = new TMap.LatLng(item[1], item[0]);
                        const coord = map.glLatLngToPosition(LatLng);
                        return [coord.x, coord.y, 0];
                    });

                    // 重新计算形状和位置
                    const shapePoints = points.map(v => new THREE.Vector2(v[0], v[1]));
                    const shape = new THREE.Shape(shapePoints);
                    const geometry = new THREE.ExtrudeGeometry(shape, {
                        depth: 30,
                        bevelEnabled: false,
                    });
                    geometry.translate(0, 0, child.userData.floorIndex * 30);

                    child.geometry.dispose();
                    child.geometry = geometry;
                }
            });

            renderer.render(scene, camera);
        },
    });

    function create3DBuilding(data, index) {
        const height = 30; // 默认高度

        const minPathX = Math.min(...data.map(v => v[0]));
        const minPathY = Math.min(...data.map(v => v[1]));
        const shapePoints = data.map(v => new THREE.Vector2(v[0] - minPathX, v[1] - minPathY));

        // 创建侧面几何体
        const shape = new THREE.Shape(shapePoints);
        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: height,
            bevelEnabled: false,
        });

        // 创建材质
        const material = new THREE.MeshStandardMaterial({
            color: 0x007acc,
            roughness: 0.7,
            metalness: 0.0,
            wireframe: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(minPathX, minPathY, (index - 1) * height);

        return mesh;
    }

    function createBuildings(polygon) {
        let buildGroup = new THREE.Group();

        let points = polygon.coordinates[0].map(item => {
            const LatLng = new TMap.LatLng(item[1], item[0]);
            const coord = map.glLatLngToPosition(LatLng);
            return [coord.x, coord.y, 0];
        });
        // let points2 = polygon.coordinates[0].map(v => {
        //     return latLonToThreeJS(v[1], v[0]);
        // });

        let totalFloor = 10;
        let floorHeight = 31.5;
        // for (let i = 0; i < totalFloor; i++) {
        //     createBuildingFloorByHouse(buildGroup, points2, floorHeight, i);
        // }
        for (let i = 0; i < totalFloor; i++) {
            group.add(create3DBuilding(points, i));
        }

        // group.add(buildGroup);
    }

    function createBuildingFloorByHouse(buildGroup, points, floorHeight, index) {
        const geometry = getGeometryWithoutSouthWall(points, floorHeight * index, floorHeight);
        const material = new THREE.MeshLambertMaterial({
            color: 0xa293f3,
            emissive: 0xa293f3,
            emissiveIntensity: 0.6,
            side: THREE.DoubleSide,
            depthTest: true,
            polygonOffset: true, // 启用多边形偏移
            polygonOffsetFactor: 1, // 偏移因子
            polygonOffsetUnits: 1, // 偏移单位
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        buildGroup.add(mesh);

        // 创建边缘几何体
        const edgeGeometry = new THREE.EdgesGeometry(geometry, 1);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x2c216d,
            depthTest: true,
            polygonOffset: true,
            polygonOffsetFactor: -1, // 负值使边缘向内偏移
            polygonOffsetUnits: 3, // 更大的偏移值
        });
        const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edgeLines.renderOrder = 1; // 设置渲染顺序
        buildGroup.add(edgeLines);
    }
    function getGeometryWithoutSouthWall(points, baseHeight, floorHeight) {
        // 1. 准备顶部和底部点
        var topPoints = []; // 存储顶部点
        let basePoints = JSON.parse(JSON.stringify(points)); // 深拷贝底部点
        // 2. 设置底部和顶部点的高度
        for (let i = 0; i < basePoints.length; i++) {
            basePoints[i][2] = baseHeight;
            topPoints.push([basePoints[i][0], basePoints[i][1], baseHeight + floorHeight]);
        }
        // 3. 合并所有点
        var totalPoints = basePoints.concat(topPoints);

        // 4. 创建顶点数组
        const vertices = new Float32Array(totalPoints.length * 3);
        for (let i = 0; i < totalPoints.length; i++) {
            vertices[i * 3] = totalPoints[i][0];
            vertices[i * 3 + 1] = totalPoints[i][1];
            vertices[i * 3 + 2] = totalPoints[i][2];
        }

        // 5. 创建索引数组
        const indices = [];
        const length = points.length;

        // 6. 创建侧面
        for (let j = 0; j < length; j++) {
            // if (southWallPointIndex.indexOf(j) != -1) {
            //   continue
            // }
            if (j != length - 1) {
                // 正常情况：连接当前点和下一个点
                indices.push(j, j + 1, length + j + 1);
                indices.push(length + j + 1, length + j, j);
            } else {
                // 最后一个点：连接回第一个点
                indices.push(j, 0, length);
                indices.push(length, length + j, j);
            }
        }

        // 7. 创建顶部和底部的三角形
        // 准备用于三角化的数据
        const data = [];
        for (let i = 0; i < length; i++) {
            data.push(points[i][0], points[i][1]); // 使用x,y坐标进行三角化
        }
        // 使用Earcut进行三角化
        // const triangles = EARCUT(data);
        // // 添加顶部和底部的三角形
        // if (triangles && triangles.length != 0) {
        //   for (let i = 0; i < triangles.length; i++) {
        //     var tlength = triangles.length;
        //     if (i % 3 == 0 && i < tlength - 2) {
        //       //底部的三角面
        //       indices.push(triangles[i], triangles[i + 1], triangles[i + 2]);
        //       //顶部的三角面
        //       indices.push(
        //         triangles[i] + length,
        //         triangles[i + 1] + length,
        //         triangles[i + 2] + length
        //       );
        //     }
        //   }
        // }

        // 8. 创建最终的几何体
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        return geometry;
    }
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
    const vectors = coords.map(e => latLonToThreeJS(e.lat, e.lon));

    // 计算宽度、高度和深度
    const width = Math.max(...vectors.map(v => v.x)) - Math.min(...vectors.map(v => v.x));
    const height = Math.max(...vectors.map(v => v.y)) - Math.min(...vectors.map(v => v.y));
    const depth = 50; // 假设的深度

    // 创建立方体几何形状
    let geometry = new THREE.BoxGeometry(width * 1000000, height * 1000000, depth);

    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // 立方体纹理贴图
    // 前面
    const textureFront = new THREE.TextureLoader().load(new URL('./assets/textures/front.png', import.meta.url));
    textureFront.flipY = false;
    // 后面
    const textureBack = new THREE.TextureLoader().load(new URL('./assets/textures/back.png', import.meta.url));
    textureBack.flipY = false;
    // 上面
    const textureTop = new THREE.TextureLoader().load(new URL('./assets/textures/top.png', import.meta.url));
    textureTop.flipY = false;

    // 上背面
    const textureTopBack = new THREE.TextureLoader().load(new URL('./assets/textures/top_back.png', import.meta.url));
    textureTopBack.flipY = false;
    // 侧面
    const textureSide = new THREE.TextureLoader().load(new URL('./assets/textures/side.png', import.meta.url));
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

            layer = new THREE.Mesh(new THREE.BoxGeometry(width * 1000000, height * 1000000, depth), material);

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
    const lats = coords.map(coord => coord.lat);
    const lons = coords.map(coord => coord.lon);

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
