AFRAME.registerComponent("starsky", {
  stars: [],

  init: function () {
    this.addSphere();
  },

  addSphere: function () {
    // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
    for (var z = -1000; z < 1000; z += 10) {
      // Make a sphere (exactly the same as before).
      var geometry = new THREE.SphereGeometry(0.5, 8, 8);
      var material = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });
      var sphere = new THREE.Mesh(geometry, material);

      sphere.position.x = Math.random() * 1000 - 500;
      sphere.position.y = Math.random() * 50 - 25;

      // Then set the z position to where it is in the loop (distance of camera)
      sphere.position.z = z;

      //finally push it to the stars array
      var entityEl = document.createElement("a-entity");
      entityEl.setObject3D("mesh", sphere);
      this.el.appendChild(entityEl);
      this.stars.push(sphere);
    }
  },

  animateStars: function () {
    for (var i = 0; i < this.stars.length; i++) {
      star = this.stars[i];

      // and move it forward dependent on the mouseY position.
      star.position.z += i / 50;

      // if the particle is too close move it to the back
      if (star.position.z > 0) star.position.z -= 1000;
    }
  },

  tick: function (t) {
    this.animateStars();
  },
});

AFRAME.registerComponent("earth", {
  earthMesh: null,
  init: function () {
    this.addEarth();
  },

  addEarth: function () {
    var earthGeometry = new THREE.SphereGeometry(10, 50, 50);
    var earthMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture("../images/earth_texture_2.jpg"),
      color: 0xf2f2f2,
      specular: 0xbbbbbb,
      shininess: 2,
    });
    this.earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);

    var entityEl = document.createElement("a-entity");
    entityEl.setObject3D("mesh", this.earthMesh);
    this.el.appendChild(entityEl);
  },

  rotateEarth: function () {
    this.earthMesh.rotation.y += 0.002;
  },

  tick: function (t) {
    this.rotateEarth();
  },
});

AFRAME.registerComponent("blog", {
  slideIndex: 0,
  init: function () {
    this.changeBlog(this);
  },

  changeBlog: function (ref) {
    var i;
    var slides = document.getElementsByClassName("slide");
    for (i = 0; i < slides.length; i++) {
      slides[i].setAttribute("visible", "false");
      slides[i].setAttribute("animation", "property: opacity; from:1; to: 0; dur: 1000; easing: linear; loop:false");
    }
    ref.slideIndex++;
    if (ref.slideIndex > slides.length) {
      ref.slideIndex = 1;
    }

    slides[ref.slideIndex - 1].setAttribute("visible", "true");
    slides[ref.slideIndex - 1].setAttribute("animation", "property: opacity; from:0; to: 1; dur: 1000; easing: linear; loop:false");
    setTimeout(function () {
      ref.changeBlog(ref);
    }, 5000);
  },
});
