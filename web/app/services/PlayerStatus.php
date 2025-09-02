<?php
class PlayerStatus
{
    private const ALLOWED_STATUSES = ['online', 'idle', 'offline'];
    private $playerId;
    public $playerName;
    private $status = 'online';
    private $effects = [];

    public function __construct($playerId, $playerName)
    {
        $this->playerId = $playerId;
        $this->playerName = $playerName;
    }

    public function setStatus($newStatus)
    {
        if (in_array($newStatus, self::ALLOWED_STATUSES)) {
            $this->status = $newStatus;
            echo "Player " . $this->playerName . "'s status is now " . $this->status . ".\n";
            return true;
        }
        echo "Warning: Invalid status '" . $newStatus . "' for player " . $this->playerName . ".\n";
        return false;
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function applyEffect($effectName, $duration)
    {
        $this->effects[$effectName] = $duration;
    }

    public function isPoisoned()
    {
        return isset($this->effects['poison']);
    }
}