<?php

namespace App\Enums;

enum RentalStatus: string
{
    case Scheduled = 'scheduled';

    case Active = 'active';

    case Finished = 'finished';

    case Late = 'late';
}
