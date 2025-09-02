<?php
class GameLogger
{
    private $logFile;
    public $logProcessor;
    public $logData;

    public function __construct()
    {
        $this->logFile = '/var/log/game.log';
    }

    public function handleLog($logMessage, $logLevel = 'INFO')
    {

        $level = strtoupper($logLevel);

        switch ($level) {
            case 'WARN':
                $this->warn($logMessage);
                break;
            case 'ERROR':
                $this->error($logMessage);
                break;
            case 'INFO':
            default:
                $this->info($logMessage);
                break;
        }
        if (isset($this->logProcessor) && isset($this->logData)) {
            call_user_func($this->logProcessor, $this->logData);
        }
    }

    // Các phương thức ghi log chi tiết
    public function info($message)
    {
        file_put_contents($this->logFile, "[INFO] " . date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
    }
    public function error($message)
    {
        file_put_contents($this->logFile, "[ERROR] " . date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
    }
    public function warn($message)
    {
        file_put_contents($this->logFile, "[WARN] " . date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
    }
}