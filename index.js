const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const w = 800, h = 600;

const data = {
  point: {
    x: 220,
    y: 300,
  },

  base: {
    x: 100,
    y: 500,
  },

  armA: {
    length: 300,
    angle: -90 * Math.PI / 180,
  },
  armB: {
    length: 200,
    angle: 0 * Math.PI / 180,
  }
};

const getJoints = (dataObj) => {
  const { armA, armB, base } = dataObj;
  const xA = armA.length * Math.cos(armA.angle) + base.x;
  const yA = armA.length * Math.sin(armA.angle) + base.y;
  
  const xB = armB.length * Math.cos(armB.angle) + xA;
  const yB = armB.length * Math.sin(armB.angle) + yA;
  
  return {
    A: { x: xA, y: yA },
    B: { x: xB, y: yB },
  };
};

const getDistance = (arm1, arm2) => {
  const { B } = getJoints({ armA: arm1, armB: arm2, base: data.base });
  const { x, y } = data.point;
  const h = x - B.x;
  const v = y - B.y;
  return Math.sqrt(h*h + v*v);
}

const canTouch = () => {
  const d = Math.sqrt(Math.pow(data.point.x - data.base.x, 2) + Math.pow(data.point.y - data.base.y, 2));
  return d < data.armA.length + data.armB.length;
}

const render = () => {
  canvas.width = canvas.width;
  ctx.fillStyle = '#444';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#f00';
  ctx.fillRect(data.point.x, data.point.y, 10, 10);

  const color = !canTouch() ? '#f00' : '#0f0';

  ctx.fillStyle = color;
  ctx.fillRect(data.base.x - 15, data.base.y - 15, 30, 30);

  const { A, B } = getJoints(data);
  ctx.strokeStyle = color;
  ctx.strokeWidth = 5;
  ctx.moveTo(data.base.x, data.base.y);
  ctx.lineTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);

  ctx.stroke();
};

const tickGradientStep = () => {
  if (!canTouch()) {
    // return;
  }
  const { armA, armB } = data;
  const step = 0.005 * Math.PI / 180;
  const gA = getDistance(
    {
      ...armA,
      angle: armA.angle + step,
    },
    armB,
  ) - getDistance(
    {
      ...armA,
      angle: armA.angle - step,
    },
    armB,
  );
  const gB = getDistance(
    {
      ...armB,
      angle: armB.angle + step,
    },
    armA,
  ) - getDistance(
    {
      ...armB,
      angle: armB.angle - step,
    },
    armA,
  );


  data.armA.angle -= gA;
  if (armB.angle - gB > data.armA.angle) {
    data.armB.angle -= gB;
  } else {
    data.armB.angle += 0.1;
  }
};
const start = () => {
  setInterval(() => {
    if (getDistance(data.armA, data.armB) > 10) {
      tickGradientStep();
    }
    render();
  }, 30);
};

render();
setTimeout(start, 500);

canvas.addEventListener('mousemove', e => {
  console.log(e);
  const { clientX, clientY } = e;
  data.point.x = clientX;
  data.point.y = clientY;
});