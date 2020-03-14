var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
                    player: null,
                    healthpoints: null,
                    reticle: null,
                    moveKeys: null,
                    playerBullets: null,
                    enemyBullets: null,
                    time: 0,
                }
    }
};
var game = new Phaser.Game(config);

var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

   
    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.setSize(12, 12, true);
    },

    fire: function (shooter, target)
    {
        this.setPosition(shooter.x, shooter.y); 
        this.direction = Math.atan( (target.x-this.x) / (target.y-this.y));


        if (target.y >= this.y)
        {
            this.xSpeed = this.speed*Math.sin(this.direction);
            this.ySpeed = this.speed*Math.cos(this.direction);
        }
        else
        {
            this.xSpeed = -this.speed*Math.sin(this.direction);
            this.ySpeed = -this.speed*Math.cos(this.direction);
        }

        this.rotation = shooter.rotation;
        this.born = 0; 
    },

  
    update: function (time, delta)
    {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});

function preload ()
{

    this.load.spritesheet('player_handgun', 'assets/sprites/player_handgun.png',
        { frameWidth: 66, frameHeight: 60 }
    ); 
    this.load.image('bullet', 'assets/sprites/bullet6.png');
    this.load.image('target', 'assets/sprites/target.png');
    this.load.image('background', 'assets/sprites/bg.jpg');
    this.load.image('health', 'assets/sprites/health.png');
}

function create ()
{


   
    this.physics.world.setBounds(0, 0, 1600, 1200);

    playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });


    var background = this.add.image(800, 600, 'background');
    player = this.physics.add.sprite(800, 600, 'player_handgun');
    enemy = this.physics.add.sprite(300, 600, 'player_handgun');
    reticle = this.physics.add.sprite(800, 700, 'target');
    hp1 = this.add.image(-350, -250, 'health').setScrollFactor(0.5, 0.5);
    hp2 = this.add.image(-300, -250, 'health').setScrollFactor(0.5, 0.5);
    hp3 = this.add.image(-250, -250, 'health').setScrollFactor(0.5, 0.5);


    background.setOrigin(0.5, 0.5).setDisplaySize(1600, 1200);
    player.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true).setDrag(500, 500);
    enemy.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true);
    reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true);
    hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);


    player.health = 3;
    enemy.health = 3;
    enemy.lastFired = 0;

    this.cameras.main.zoom = 0.5;
    this.cameras.main.startFollow(player);

 
    moveKeys = this.input.keyboard.addKeys({
        'up': Phaser.Input.Keyboard.KeyCodes.W,
        'down': Phaser.Input.Keyboard.KeyCodes.S,
        'left': Phaser.Input.Keyboard.KeyCodes.A,
        'right': Phaser.Input.Keyboard.KeyCodes.D
    });



    this.input.keyboard.on('keydown_UP', function (event) {
        player.setAccelerationY(-800);
    });
    this.input.keyboard.on('keydown_DOWN', function (event) {
        player.setAccelerationY(800);
    });
    this.input.keyboard.on('keydown_LEFT', function (event) {
        player.setAccelerationX(-800);
    });
    this.input.keyboard.on('keydown_RIGHT', function (event) {
        player.setAccelerationX(800);
    });

    this.input.keyboard.on('keyup_UP', function (event) {
        if (moveKeys['down'].isUp)
            player.setAccelerationY(0);
    });
    this.input.keyboard.on('keyup_DOWN', function (event) {
        if (moveKeys['up'].isUp)
            player.setAccelerationY(0);
    });
    this.input.keyboard.on('keyup_LEFT', function (event) {
        if (moveKeys['right'].isUp)
            player.setAccelerationX(0);
    });
    this.input.keyboard.on('keyup_RIGHT', function (event) {
        if (moveKeys['left'].isUp)
            player.setAccelerationX(0);
    });


    this.input.on('pointerdown', function (pointer, time, lastFired) {
        if (player.active === false)
            return;

        var bullet = playerBullets.get().setActive(true).setVisible(true);

        if (bullet)
        {
            bullet.fire(player, reticle);
            this.physics.add.collider(enemy, bullet, enemyHitCallback);
        }
    }, this);


    game.canvas.addEventListener('mousedown', function () {
        game.input.mouse.requestPointerLock();
    });

   
   

    this.input.on('pointermove', function (pointer) {
        if (this.input.mouse.locked)
        {
            reticle.x += pointer.movementX;
            reticle.y += pointer.movementY;
        }
    }, this);

}

function enemyHitCallback(enemyHit, bulletHit)
{

    if (bulletHit.active === true && enemyHit.active === true)
    {
        enemyHit.health = enemyHit.health - 1;
        console.log("Enemy hp: ", enemyHit.health);


        if (enemyHit.health <= 0)
        {
           enemyHit.setActive(false).setVisible(false);
           console.log('nice');
           alert("You WIN!");
        }

 
        bulletHit.setActive(false).setVisible(false);
    }
}

function playerHitCallback(playerHit, bulletHit)
{

    if (bulletHit.active === true && playerHit.active === true)
    {
        playerHit.health = playerHit.health - 1;
        console.log("Player hp: ", playerHit.health);

     
        if (playerHit.health == 2)
        {
            hp3.destroy();
        }
        else if (playerHit.health == 1)
        {
            hp2.destroy();
        }
        else
        {
            hp1.destroy();
            console.log('ouch');
             alert("You LOSE!");
             
             
        
        }

    
        bulletHit.setActive(false).setVisible(false);
    }
}

function enemyFire(enemy, player, time, gameObject)
{
    if (enemy.active === false)
    {
        return;
    }

    if ((time - enemy.lastFired) > 1000)
    {
        enemy.lastFired = time;

        
        var bullet = enemyBullets.get().setActive(true).setVisible(true);

        if (bullet)
        {
            bullet.fire(enemy, player);
       
            gameObject.physics.add.collider(player, bullet, playerHitCallback);
        }
    }
}


function constrainVelocity(sprite, maxVelocity)
{
    if (!sprite || !sprite.body)
      return;

    var angle, currVelocitySqr, vx, vy;
    vx = sprite.body.velocity.x;
    vy = sprite.body.velocity.y;
    currVelocitySqr = vx * vx + vy * vy;

    if (currVelocitySqr > maxVelocity * maxVelocity)
    {
        angle = Math.atan2(vy, vx);
        vx = Math.cos(angle) * maxVelocity;
        vy = Math.sin(angle) * maxVelocity;
        sprite.body.velocity.x = vx;
        sprite.body.velocity.y = vy;
    }
}


function constrainReticle(reticle)
{
    var distX = reticle.x-player.x; 
    var distY = reticle.y-player.y; 


    if (distX > 800)
        reticle.x = player.x+800;
    else if (distX < -800)
        reticle.x = player.x-800;

    if (distY > 600)
        reticle.y = player.y+600;
    else if (distY < -600)
        reticle.y = player.y-600;
}

function update (time, delta)
{

    player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

   
    enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);

   
    reticle.body.velocity.x = player.body.velocity.x;
    reticle.body.velocity.y = player.body.velocity.y;

  
    constrainVelocity(player, 500);

    constrainReticle(reticle);

 
    enemyFire(enemy, player, time, this);
}
