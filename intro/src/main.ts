import './style.css';
import { createScene } from './scene';

const app = document.getElementById('app')!;
const { renderer, scene, camera } = createScene(app);

// Render loop
function tick() {
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
