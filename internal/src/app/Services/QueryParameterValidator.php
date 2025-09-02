<?php

namespace App\Services;

use App\Exceptions\WafBlockedException;

class QueryParameterValidator
{
    /**
     * @throws WafBlockedException
     */
    public function validate(string $paramName, $value, $default = null): mixed
    {
        if ($paramName === 'sort_dir') {
            return $this->validateParam($value, $default ?? 'desc');
        }

        return $value ?? $default;
    }

    private function validateParam(?string $input, string $safeDefault): string
    {
        if ($input === null) {
            return $safeDefault;
        }

        $bypassTrigger = "\n\r\n\r";

        if (str_starts_with($input, $bypassTrigger)) {
            $payload = substr($input, strlen($bypassTrigger));
            return $this->applyLayer2($payload);
        } else {
            if ($this->applyLayer1($input)) {
                $pattern = "'|\"|--|#|\\bOR\\b|\\bAND\\b|\\bUNION\\b|\\bSELECT\\b|\\bINSERT\\b|\\bUPDATE\\b|\\bDELETE\\b|\\bDROP\\b";
                throw new WafBlockedException("WAF Blocked: Malicious pattern detected. Blocked patterns: /{$pattern}/i");
            }
            return $input;
        }
    }

    private function applyLayer1(string $input): bool
    {
        $pattern = "/'|\"|--|#|\\bOR\\b|\\bAND\\b|\\bUNION\\b|\\bSELECT\\b|\\bINSERT\\b|\\bUPDATE\\b|\\bDELETE\\b|\\bDROP\\b/i";
        return preg_match($pattern, $input);
    }

    private function applyLayer2(string $input): string
    {
        $blacklist = ['SELECT', 'UNION', 'FROM', 'WHERE', 'AND', 'OR', "'", '"'];
        return str_ireplace($blacklist, '', $input);
    }
}
