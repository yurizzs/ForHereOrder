<?php

namespace App\Enums;

enum UserRole: string
{
    case VENDOR = 'vendor';
    case ADMIN = 'admin';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
