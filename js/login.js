const fragmentShaderSource = `#version 300 es
    precision highp float;

    uniform float time;
    uniform vec2 vp;

    in vec2 uv;
    out vec4 fragColor;

    float rand(vec2 p) {
        return fract(sin(dot(p.xy, vec2(1., 300.))) * 43758.5453123);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);

        float a = rand(i);
        float b = rand(i + vec2(1.0, 0.0));
        float c = rand(i + vec2(0.0, 1.0));
        float d = rand(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(a, b, u.x) +
                (c - a)* u.y * (1.0 - u.x) +
                (d - b) * u.x * u.y;
    }

    #define OCTAVES 5
    float fbm(vec2 p) {
        float value = 0.;
        float amplitude = .4;
        float frequency = 0.;

        for (int i = 0; i < OCTAVES; i++) {
            value += amplitude * noise(p);
            p *= 2.;
            amplitude *= .4;
        }
        return value;
    }

    void main() {
        vec2 p = uv.xy;
        p.x *= vp.x / vp.y;

        float gradient = mix(p.y*.6 + .1, p.y*1.2 + .9, fbm(p));
        float speed = 0.2;
        float details = 7.;
        float force = .9;
        float shift = .5;

        vec2 fast = vec2(p.x, p.y - time*speed) * details;
        float ns_a = fbm(fast);
        float ns_b = force * fbm(fast + ns_a + time) - shift;
        float nns = force * fbm(vec2(ns_a, ns_b));
        float ins = fbm(vec2(ns_b, ns_a));

        vec3 c1 = mix(vec3(.9, .5, .3), vec3(.5, .0, .0), ins + shift);

        fragColor = vec4(c1 + vec3(ins - gradient), 1.0);
    }`;

    class WebGLHandler {
      vertexShaderSource = `#version 300 es
        precision mediump float;
        const vec2 positions[6] = vec2[6](vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0), vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0));
        out vec2 uv;
        void main() {
            uv = positions[gl_VertexID];
            gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
        }`;

      constructor(canvas, fragmentShaderSource) {
        this.cn = canvas;
        this.gl = canvas.getContext('webgl2');
        this.startTime = Date.now();

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.program = this.gl.createProgram();
        this.compileShader(this.vertexShaderSource, this.gl.VERTEX_SHADER);
        this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);

        this.timeLocation = this.gl.getUniformLocation(this.program, 'time');
        this.resolutionLocation = this.gl.getUniformLocation(this.program, 'vp');

        this.render();
      }

      resize() {
        this.cn.width = window.innerWidth;
        this.cn.height = window.innerHeight;
        this.gl.viewport(0, 0, this.cn.width, this.cn.height);
      }

      compileShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          console.error(this.gl.getShaderInfoLog(shader));
          this.gl.deleteShader(shader);
          return null;
        }
        return this.gl.attachShader(this.program, shader);
      }

      render = () => {
        this.gl.uniform1f(this.timeLocation, (Date.now() - this.startTime) / 1000);
        this.gl.uniform2fv(this.resolutionLocation, [this.cn.width, this.cn.height]);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        window.requestAnimationFrame(this.render);
      }
    }

    const canvas = document.body.appendChild(document.createElement('canvas'));
    document.body.style.margin = "0";
    document.body.style.height = "100vh";
    canvas.style.display = "block";
    const webGL = new WebGLHandler(canvas, fragmentShaderSource);

    const $card = document.querySelector(".login-container");

    const cardUpdate = (e) => {
      const position = pointerPositionRelativeToElement($card, e);
      const [px, py] = position.pixels;
      const [perx, pery] = position.percent;
      const [dx, dy] = distanceFromCenter($card, px, py);
      const edge = closenessToEdge($card, px, py);
      const angle = angleFromPointerEvent($card, dx, dy);

      $card.style.setProperty('--pointer-x', `${round(perx)}%`);
      $card.style.setProperty('--pointer-y', `${round(pery)}%`);
      $card.style.setProperty('--pointer-°', `${round(angle)}deg`);
      $card.style.setProperty('--pointer-d', `${round(edge * 100)}`);

      $card.classList.remove('animating');
    };

    $card.addEventListener("pointermove", cardUpdate);

    const centerOfElement = ($el) => {
      const { left, top, width, height } = $el.getBoundingClientRect();
      return [width / 2, height / 2];
    };

    const pointerPositionRelativeToElement = ($el, e) => {
      const pos = [e.clientX, e.clientY];
      const { left, top, width, height } = $el.getBoundingClientRect();
      const x = pos[0] - left;
      const y = pos[1] - top;
      const px = clamp((100 / width) * x);
      const py = clamp((100 / height) * y);
      return { pixels: [x, y], percent: [px, py] };
    };

    const angleFromPointerEvent = ($el, dx, dy) => {
      let angleRadians = 0;
      let angleDegrees = 0;
      if (dx !== 0 || dy !== 0) {
        angleRadians = Math.atan2(dy, dx);
        angleDegrees = angleRadians * (180 / Math.PI) + 90;
        if (angleDegrees < 0) {
          angleDegrees += 360;
        }
      }
      return angleDegrees;
    };

    const distanceFromCenter = ($card, x, y) => {
      const [cx, cy] = centerOfElement($card);
      return [x - cx, y - cy];
    };

    const closenessToEdge = ($card, x, y) => {
      const [cx, cy] = centerOfElement($card);
      const [dx, dy] = distanceFromCenter($card, x, y);
      let k_x = Infinity;
      let k_y = Infinity;
      if (dx !== 0) {
        k_x = cx / Math.abs(dx);
      }
      if (dy !== 0) {
        k_y = cy / Math.abs(dy);
      }
      return clamp((1 / Math.min(k_x, k_y)), 0, 1);
    };

    const round = (value, precision = 3) => parseFloat(value.toFixed(precision));

    const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);

    const playAnimation = () => {
      const angleStart = 310;
      const angleEnd = 525;

      $card.style.setProperty('--pointer-°', `${angleStart}deg`);
      $card.classList.add('animating');

      animateNumber({
        ease: easeOutCubic,
        duration: 500,
        onUpdate: (v) => {
          $card.style.setProperty('--pointer-d', v);
        }
      });

      animateNumber({
        ease: easeInCubic,
        delay: 0,
        duration: 1500,
        endValue: 50,
        onUpdate: (v) => {
          const d = (angleEnd - angleStart) * (v / 100) + angleStart;
          $card.style.setProperty('--pointer-°', `${d}deg`);
        }
      });

      animateNumber({
        ease: easeOutCubic,
        delay: 1500,
        duration: 2250,
        startValue: 50,
        endValue: 100,
        onUpdate: (v) => {
          const d = (angleEnd - angleStart) * (v / 100) + angleStart;
          $card.style.setProperty('--pointer-°', `${d}deg`);
        }
      });

      animateNumber({
        ease: easeInCubic,
        duration: 1500,
        delay: 2500,
        startValue: 100,
        endValue: 0,
        onUpdate: (v) => {
          $card.style.setProperty('--pointer-d', v);
        },
        onEnd: () => {
          $card.classList.remove('animating');
        }
      });
    };

    setTimeout(() => {
      playAnimation();
    }, 500);

    function easeOutCubic(x) {
      return 1 - Math.pow(1 - x, 3);
    }

    function easeInCubic(x) {
      return x * x * x;
    }

    function animateNumber(options) {
      const {
        startValue = 0,
        endValue = 100,
        duration = 1000,
        delay = 0,
        onUpdate = () => { },
        ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        onStart = () => { },
        onEnd = () => { },
      } = options;

      const startTime = performance.now() + delay;

      function update() {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const t = Math.min(elapsed / duration, 1);
        const easedValue = startValue + (endValue - startValue) * ease(t);

        onUpdate(easedValue);

        if (t < 1) {
          requestAnimationFrame(update);
        } else if (t >= 1) {
          onEnd();
        }
      }

      setTimeout(() => {
        onStart();
        requestAnimationFrame(update);
      }, delay);
    }

    const $app = document.querySelector('.wrapper');
    const $moon = document.querySelector(".moon");
    const $sun = document.querySelector(".sun");

    $moon.addEventListener('click', () => {
      document.body.classList.remove('light');
      $app.classList.remove('light');
    });

    $sun.addEventListener('click', () => {
      document.body.classList.add('light');
      $app.classList.add('light');
    });

    // Text animation script
    $(function () {
      $('.intro').addClass('go');

      $('.reload').click(function () {
        $('.intro').removeClass('go').delay(200).queue(function (next) {
          $('.intro').addClass('go');
          next();
        });
      });
    });

    let auth;

    async function initializeFirebase() {
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        const firebaseConfig = {
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId,
          measurementId: config.measurementId
        };

        // Initialize Firebase
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        auth = firebase.auth();
        
        // Setup auth state change listener after auth is ready
        auth.onAuthStateChanged(user => {
          if (user) {
            console.log("User is logged in:", user.email);
            document.getElementById("message").textContent = `Welcome back, ${user.email}!`;
          } else {
            console.log("No user is logged in.");
          }
        });

      } catch (error) {
        console.error("Firebase initialization failed:", error);
        document.getElementById("message").textContent = "Error initializing authentication service.";
      }
    }

    initializeFirebase();

    function signUp() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const message = document.getElementById("message");

      if (!auth) {
        message.textContent = "Authentication is still initializing. Please wait...";
        return;
      }

      if (!email || !password) {
        message.textContent = "Please fill in all fields.";
        return;
      }

      auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
          message.style.color = "#00ffcc";
          message.textContent = "Sign up successful!";
          setTimeout(() => {
            window.location.href = "main.html";
          }, 1000);
        })
        .catch(error => {
          message.style.color = "#f44336";
          message.textContent = "Error: " + error.message;
          console.error("Sign-up error:", error);
        });
    }

    function logIn() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const rememberMe = document.getElementById("rememberMe").checked;
      const message = document.getElementById("message");

      console.log("Remember Me checked:", rememberMe);

      if (!auth) {
        message.textContent = "Authentication is still initializing. Please wait...";
        return;
      }

      if (!email || !password) {
        message.textContent = "Please fill in all fields.";
        return;
      }

      const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;

      auth.setPersistence(persistence)
        .then(() => {
          console.log("Persistence set to:", persistence);
          return auth.signInWithEmailAndPassword(email, password);
        })
        .then(() => {
          message.style.color = "#00ffcc";
          message.textContent = "Login successful!";
          window.location.href = "main.html";
        })
        .catch(error => {
          message.style.color = "#f44336";
          message.textContent = "Error: " + error.message;
          console.error("Login error:", error);
        });
    }