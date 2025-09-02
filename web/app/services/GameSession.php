<?php
class GameSession
{
    public $playerName;
    public $inventory;
    public $playerStatus;

    public function __construct($playerName, $inventoryObject, $playerStatusObject)
    {
        $this->playerName = $playerName;
        $this->inventory = $inventoryObject;
        $this->playerStatus = $playerStatusObject;
    }


    public function __wakeup()
    {
        echo "Waking up session for player " . $this->playerName . ". Syncing state...\n";
        $currentGold = $this->inventory->gold;
        echo "Player gold synced: " . $currentGold . "\n";
    }

    public function setStatus($newStatus)
    {
        return $this->playerStatus->setStatus($newStatus);
    }

    public function goIdle()
    {
        $this->setStatus('idle');
    }

    public function logout()
    {
        $this->setStatus('offline');
    }

    public function getStatus()
    {
        return $this->playerStatus->getStatus();
    }
}