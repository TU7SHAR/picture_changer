import "./style.css";
import * as THREE from "three";
import vertex from "../shaders/vertex.glsl";
import fragment from "../shaders/fragment.glsl";
import gsap from "gsap";

class Site {
  constructor({ dom }) {
    this.time = 0;
    this.container = dom;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.images = [...document.querySelectorAll(".images img")];
    this.material;
    this.imageStore = [];

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      100,
      2000,
    );
    this.camera.position.z = 200;
    this.camera.fov = 2 * Math.atan(this.height / 2 / 200) * (180 / Math.PI);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);

    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.top = "0";
    this.renderer.domElement.style.left = "0";
    this.renderer.domElement.style.zIndex = "15";
    this.renderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(this.renderer.domElement);

    this.addImages();
    this.resize();
    this.setupResize();
    this.setPosition();
    this.hoverOverLinks();
    this.render();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.fov = 2 * Math.atan(this.height / 2 / 200) * (180 / Math.PI);
    this.camera.updateProjectionMatrix();
    this.setPosition();
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  setPosition() {
    this.imageStore.forEach((img) => {
      const bounds = img.img.getBoundingClientRect();
      img.mesh.position.y = -bounds.top + this.height / 2 - bounds.height / 2;
      img.mesh.position.x = bounds.left - this.width / 2 + bounds.width / 2;
      img.mesh.scale.set(bounds.width, bounds.height, 1);
    });
  }

  addImages() {
    const textureLoader = new THREE.TextureLoader();
    const textures = this.images.map((img) => textureLoader.load(img.src));

    const uniforms = {
      uTime: { value: 0 },
      uTimeline: { value: 0.0 },
      uStartIndex: { value: 0 },
      uEndIndex: { value: 0 },
      uImage0: { value: textures[0] },
      uImage1: { value: textures[1] },
      uImage2: { value: textures[2] },
      uImage3: { value: textures[3] },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(1, 1);

    this.images.forEach((img) => {
      const bounds = img.getBoundingClientRect();
      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.scale.set(bounds.width, bounds.height, 1);

      this.scene.add(mesh);
      this.imageStore.push({
        img: img,
        mesh: mesh,
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      });
    });
  }

  hoverOverLinks() {
    const links = document.querySelectorAll(".links a");
    links.forEach((link, index) => {
      link.addEventListener("mouseenter", () => {
        if (this.material.uniforms.uStartIndex.value === index) return;

        this.material.uniforms.uTimeline.value = 0.0;
        this.material.uniforms.uEndIndex.value = index;

        gsap.to(this.material.uniforms.uTimeline, {
          value: 2.0,
          duration: 1.5,
          ease: "power2.out",
          onComplete: () => {
            this.material.uniforms.uStartIndex.value = index;
          },
        });
      });
    });
  }

  render() {
    this.time++;
    this.material.uniforms.uTime.value = this.time;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Site({ dom: document.querySelector(".canvas") });
