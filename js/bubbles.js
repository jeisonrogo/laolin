// Sistema de Burbujas Animadas
class Bubble {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = this.canvas.height + 20;
        this.size = Math.random() * 50 + 5;
        this.speed = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.originalX = this.x;
        this.originalY = this.y;
        this.originalSpeed = this.speed;
        this.originalOpacity = this.opacity;
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = (Math.random() - 0.5) * 0.02;
    }

    update(mouseX, mouseY) {
        // Movimiento normal hacia arriba
        this.y -= this.speed;
        this.x += Math.sin(this.angle) * 0.5;
        this.angle += this.angleSpeed;

        // Interacción con el mouse
        if (mouseX !== null && mouseY !== null) {
            const distance = Math.sqrt(
                Math.pow(this.x - mouseX, 2) + Math.pow(this.y - mouseY, 2)
            );
            const maxDistance = 200;

            if (distance < maxDistance) {
                const force = (maxDistance - distance) / maxDistance;
                const angleToMouse = Math.atan2(this.y - mouseY, this.x - mouseX);
                
                // Repulsión del mouse
                this.x += Math.cos(angleToMouse) * force * 2;
                this.y += Math.sin(angleToMouse) * force * 2;
                
                // Efecto de dispersión
                this.speed = this.originalSpeed * (1 + force * 0.5);
                this.opacity = this.originalOpacity * (1 - force * 0.3);
            } else {
                // Retorno gradual a valores originales
                this.speed += (this.originalSpeed - this.speed) * 0.05;
                this.opacity += (this.originalOpacity - this.opacity) * 0.05;
            }
        } else {
            // Retorno gradual a valores originales cuando no hay mouse
            this.speed += (this.originalSpeed - this.speed) * 0.05;
            this.opacity += (this.originalOpacity - this.opacity) * 0.05;
        }

        // Fade out al llegar a la parte superior
        if (this.y < 50) {
            this.opacity *= 0.95;
        }

        // Resetear burbuja si sale de la pantalla o se desvanece
        if (this.y < -50 || this.opacity < 0.01) {
            this.reset();
        }
    }

    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.opacity;
        
        // Crear gradiente para la burbuja
        const gradient = this.ctx.createRadialGradient(
            this.x - this.size * 0.3, 
            this.y - this.size * 0.3, 
            0,
            this.x, 
            this.y, 
            this.size
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reflejo de la burbuja
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
}

// Sistema de animación de burbujas
class BubbleSystem {
    constructor() {
        this.canvas = document.getElementById('bubblesCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.bubbles = [];
        this.mouseX = null;
        this.mouseY = null;
        this.animationId = null;
        this.isActive = false;
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.createBubbles();
        this.setupEventListeners();
        this.animate();
    }

    resizeCanvas() {
        // Usar el viewport completo para las burbujas
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Ajustar posición del canvas
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    }

    createBubbles() {
        // Más burbujas para cubrir toda la página
        const numBubbles = 80;
        this.bubbles = [];
        
        for (let i = 0; i < numBubbles; i++) {
            const bubble = new Bubble(this.canvas, this.ctx);
            
            // Distribuir algunas burbujas por toda la pantalla inicialmente
            if (i < numBubbles * 0.3) {
                bubble.y = Math.random() * this.canvas.height;
            }
            
            this.bubbles.push(bubble);
        }
    }

    setupEventListeners() {
        // Mouse move para interactividad en toda la página
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            this.mouseX = null;
            this.mouseY = null;
        });

        // Touch events para dispositivos móviles
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
            }
        });
        
        document.addEventListener('touchend', () => {
            this.mouseX = null;
            this.mouseY = null;
        });

        // Resize del canvas cuando cambie el tamaño de la ventana
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Actualizar y dibujar todas las burbujas
        this.bubbles.forEach(bubble => {
            bubble.update(this.mouseX, this.mouseY);
            bubble.draw();
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    // Método para pausar la animación
    pause() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    // Método para reanudar la animación
    resume() {
        this.isActive = true;
        this.animate();
    }

    // Método para cambiar la cantidad de burbujas
    setBubbleCount(count) {
        const currentCount = this.bubbles.length;
        
        if (count > currentCount) {
            // Agregar burbujas
            for (let i = currentCount; i < count; i++) {
                this.bubbles.push(new Bubble(this.canvas, this.ctx));
            }
        } else if (count < currentCount) {
            // Remover burbujas
            this.bubbles = this.bubbles.slice(0, count);
        }
    }

    // Método para cambiar la velocidad de las burbujas
    setBubbleSpeed(speedMultiplier) {
        this.bubbles.forEach(bubble => {
            bubble.originalSpeed = (Math.random() * 1 + 0.5) * speedMultiplier;
        });
    }

    // Método para cambiar el tamaño de las burbujas
    setBubbleSize(sizeMultiplier) {
        this.bubbles.forEach(bubble => {
            bubble.size = (Math.random() * 50 + 5) * sizeMultiplier;
        });
    }

    // Método para obtener estadísticas de las burbujas
    getStats() {
        return {
            totalBubbles: this.bubbles.length,
            activeBubbles: this.bubbles.filter(b => b.opacity > 0.01).length,
            isActive: this.isActive,
            canvasSize: {
                width: this.canvas.width,
                height: this.canvas.height
            }
        };
    }

    destroy() {
        this.pause();
        this.bubbles = [];
        
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
            this.canvas.removeEventListener('touchstart', this.handleTouchStart);
            this.canvas.removeEventListener('touchmove', this.handleTouchMove);
            this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        }
        
        window.removeEventListener('resize', this.handleResize);
    }
}

// Inicializar el sistema de burbujas
let bubbleSystem;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el sistema de burbujas de forma simple y directa
    bubbleSystem = new BubbleSystem();
});

// Funciones globales para controlar las burbujas
function pauseBubbles() {
    if (bubbleSystem) {
        bubbleSystem.pause();
    }
}

function resumeBubbles() {
    if (bubbleSystem) {
        bubbleSystem.resume();
    }
}

function setBubbleCount(count) {
    if (bubbleSystem) {
        bubbleSystem.setBubbleCount(count);
    }
}

function setBubbleSpeed(speedMultiplier) {
    if (bubbleSystem) {
        bubbleSystem.setBubbleSpeed(speedMultiplier);
    }
}

function setBubbleSize(sizeMultiplier) {
    if (bubbleSystem) {
        bubbleSystem.setBubbleSize(sizeMultiplier);
    }
}

function getBubbleStats() {
    if (bubbleSystem) {
        return bubbleSystem.getStats();
    }
    return null;
}

// Optimización para dispositivos móviles
function optimizeForMobile() {
    if (bubbleSystem) {
        // Reducir la cantidad de burbujas en móviles para mejor rendimiento
        if (window.innerWidth < 768) {
            bubbleSystem.setBubbleCount(25);
            bubbleSystem.setBubbleSpeed(0.7);
        } else {
            bubbleSystem.setBubbleCount(50);
            bubbleSystem.setBubbleSpeed(1);
        }
    }
}

// Detectar cambios de orientación en móviles
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (bubbleSystem) {
            bubbleSystem.resizeCanvas();
        }
        optimizeForMobile();
    }, 100);
});

// Optimizar al cargar la página
window.addEventListener('load', optimizeForMobile);
