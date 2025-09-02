<?php
class Hero
{
    public $mapId;
    public $playerX;
    public $playerY;
    public $playerDirection;
    public $characterSrc;

    public function __construct($mapId, $x, $y, $dir, $src)
    {
        $this->mapId = $mapId;
        $this->playerX = $x;
        $this->playerY = $y;
        $this->playerDirection = $dir;
        $this->characterSrc = $src;
    }

    public function getPositionAsString()
    {
        return "Player is at ({$this->playerX}, {$this->playerY}) on map '{$this->mapId}'";
    }
}