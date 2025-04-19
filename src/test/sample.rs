pub struct Calculator {
    value: i32,
}

impl Calculator {
    pub fn new() -> Self {
        Calculator { value: 0 }
    }

    pub fn add(&mut self, x: i32) {
        self.value += x;
    }

    pub fn get_value(&self) -> i32 {
        self.value
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_calculator() {
        let calc = Calculator::new();
        assert_eq!(calc.get_value(), 0);
    }

    #[test]
    fn test_add() {
        let mut calc = Calculator::new();
        calc.add(5);
        assert_eq!(calc.get_value(), 5);
        calc.add(3);
        assert_eq!(calc.get_value(), 8);
    }
} 