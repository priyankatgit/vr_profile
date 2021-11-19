AFRAME.registerComponent("starsky", {
  stars: [],

  init: function () {
    this.addSphere();
  },

  addSphere: function () {
    // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
    for (let z = -1000; z < 1000; z += 10) {
      // Make a sphere (exactly the same as before).
      let geometry = new THREE.SphereGeometry(0.5, 8, 8);
      let material = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });
      let sphere = new THREE.Mesh(geometry, material);

      sphere.position.x = Math.random() * 1000 - 500;
      sphere.position.y = Math.random() * 50 - 25;

      // Then set the z position to where it is in the loop (distance of camera)
      sphere.position.z = z;

      //finally push it to the stars array
      let entityEl = document.createElement("a-entity");
      entityEl.setObject3D("mesh", sphere);
      this.el.appendChild(entityEl);
      this.stars.push(sphere);
    }
  },

  animateStars: function () {
    for (let i = 0; i < this.stars.length; i++) {
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
    let earthGeometry = new THREE.SphereGeometry(10, 50, 50);
    let earthMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture("../images/earth_texture_2.jpg"),
      color: 0xf2f2f2,
      specular: 0xbbbbbb,
      shininess: 2,
    });
    this.earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);

    let entityEl = document.createElement("a-entity");
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
  activeArticleLink: null,
  init: function () {
    this.fetchBlog();
  },

  fetchBlog: function () {
    let articleContEl = document.getElementById("articleContainer");
    articleContEl.addEventListener("click", () => {
      window.open(this.activeArticleLink, "_blank");
    });

    fetch("/hashnode_rss.xml")
      .then((response) => response.text())
      .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
      .then((data) => {
        const items = data.querySelectorAll("item");
        items.forEach((el) => {
          let blogTitle = el.querySelector("title").innerHTML.replace("<![CDATA[", "").replace("]]>", "");
          let coverImage = el.querySelector("cover_image").innerHTML;
          let pubDate = el.querySelector("pubDate").innerHTML.slice(0, 17);

          let containerEl = document.createElement("a-entity");
          containerEl.setAttribute("class", "slide");
          let articleLink = el.querySelector("link").innerHTML;
          containerEl.setAttribute("articleLink", articleLink);

          //Add assets
          let blogImg = document.createElement("img");
          const blogImgId = "blogImg" + (document.getElementsByTagName("img").length + 1);
          blogImg.setAttribute("id", blogImgId);
          blogImg.setAttribute("src", coverImage);
          blogImg.setAttribute("crossOrigin", "anonymous");
          document.getElementById("assets").appendChild(blogImg);

          let imageEl = document.createElement("a-image");
          // imageEl.setAttribute("crossOrigin", "anonymous");
          // imageEl.setAttribute("src", coverImage);
          imageEl.setAttribute("src", "#" + blogImgId);
          // imageEl.setAttribute("material", "shader: standard");
          imageEl.setAttribute("width", "1.6");
          imageEl.setAttribute("position", "0 0.15 0.001");
          containerEl.appendChild(imageEl);

          let titleEl = document.createElement("a-entity");
          titleEl.setAttribute("position", "0 -0.45 0.001");
          titleEl.setAttribute("text", "color:white;align:left;width:1.5;value:" + blogTitle + "");
          containerEl.appendChild(titleEl);

          let dateEl = document.createElement("a-entity");
          dateEl.setAttribute("position", "-0.245 -0.56 0.001");
          dateEl.setAttribute("text", "color:white;align:left;width:1;value:" + pubDate + "");
          containerEl.appendChild(dateEl);

          articleContEl.appendChild(containerEl);
        });

        this.changeBlog(this);
      });
  },

  changeBlog: function (ref) {
    let i;
    let slides = document.getElementsByClassName("slide");
    for (i = 0; i < slides.length; i++) {
      slides[i].setAttribute("visible", "false");
      slides[i].setAttribute("animation", "property: opacity; from:1; to: 0; dur: 1000; easing: linear; loop:false");
    }
    ref.slideIndex++;
    if (ref.slideIndex > slides.length) {
      ref.slideIndex = 1;
    }

    let nextSlideEl = slides[ref.slideIndex - 1];
    nextSlideEl.setAttribute("visible", "true");
    nextSlideEl.setAttribute("animation", "property: opacity; from:0; to: 1; dur: 1000; easing: linear; loop:false");

    ref.activeArticleLink = nextSlideEl.getAttribute("articleLink");

    setTimeout(function () {
      ref.changeBlog(ref);
    }, 5000);
  },
});

AFRAME.registerComponent("aboutme", {
  slideIndex: 0,
  init: function () {
    this.addSlides();
  },

  addSlides: function () {
    fetch("/aboutme.json")
      .then((response) => response.json())
      .then((data) => {
        if (data === undefined) {
          return;
        }

        for (let key in data) {
          if (key == "workat") continue;

          // if(key != "aboutWork") continue
          let title = data[key].title;
          let content = data[key].content;

          let introSlideEL = document.createElement("a-entity");
          introSlideEL.setAttribute("class", "introSlide");
          introSlideEL.setAttribute("visible", "false");

          let titleEl = document.createElement("a-entity");
          titleEl.setAttribute("position", "0 0.65 0");
          titleEl.setAttribute("text", "color:white;align:center;width:3.5;value:" + title + "");
          introSlideEL.appendChild(titleEl);

          let boardText = "";
          content.forEach((text) => {
            boardText += text + "\n\n";
          });

          let contentEL = document.createElement("a-entity");
          contentEL.setAttribute("position", "0 0.45 0");
          contentEL.setAttribute("text", "baseline:top;wrapCount:50;color:white;align:left;width:2.8;value:" + boardText + "");
          introSlideEL.appendChild(contentEL);

          this.el.appendChild(introSlideEL);
          console.log(introSlideEL);
        }
      });

    this.changeSlide(this);
  },

  changeSlide: function (ref) {
    let i;
    let slides = document.getElementsByClassName("introSlide");
    console.log(slides.length);
    for (i = 0; i < slides.length; i++) {
      slides[i].setAttribute("visible", "false");
      slides[i].setAttribute("animation", "property: opacity; from:1; to: 0; dur: 1000; easing: linear; loop:false");
    }
    ref.slideIndex++;
    if (ref.slideIndex > slides.length) {
      ref.slideIndex = 1;
    }

    let nextSlideEl = slides[ref.slideIndex - 1];
    nextSlideEl.setAttribute("visible", "true");
    nextSlideEl.setAttribute("animation", "property: opacity; from:0; to: 1; dur: 1000; easing: linear; loop:false");

    document.getElementById("slideNr").setAttribute("value", ref.slideIndex + "/4");

    setTimeout(function () {
      ref.changeSlide(ref);
    }, 5000);
  },
});
