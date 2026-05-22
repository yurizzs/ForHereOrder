<?php

namespace Database\Factories;

use App\Models\Food;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Food>
 */
class FoodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vendor_id' => User::factory(),
            'name' => $this->faker->words(3, true),
            'category' => $this->faker->randomElement(['Main Course', 'Appetizer', 'Dessert', 'Beverage', 'Side Dish']),
            'price' => $this->faker->randomFloat(2, 5, 50),
            'track_stock' => $this->faker->boolean(70),
            'stock_qty' => $this->faker->numberBetween(0, 100),
            'is_available' => $this->faker->boolean(90),
            'image' => null,
        ];
    }
}
