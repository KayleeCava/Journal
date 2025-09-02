<?php
class InventoryManager
{
    private $gold = 0;
    private $items = [];
    public $accessLogger;

    public function __construct($startGold = 100)
    {
        $this->gold = $startGold;
    }

    public function __get($propertyName)
    {
        if (isset($this->accessLogger)) {
            $this->accessLogger->handleLog("Access attempt on private property '" . $propertyName . "'", 'INFO');
        }

        switch ($propertyName) {
            case 'gold':
                return $this->gold;

            case 'items':
                return $this->items;

            default:
                if (isset($this->accessLogger)) {
                    $this->accessLogger->handleLog("Unhandled private property access: '" . $propertyName . "'", 'WARN');
                }
                return null;
        }
    }

    public function addItem($itemName, $quantity)
    {
        $this->items[$itemName] = ($this->items[$itemName] ?? 0) + $quantity;
    }

    public function spendGold($amount)
    {
        if ($this->gold >= $amount) {
            $this->gold -= $amount;
            return true;
        }
        return false;
    }
}