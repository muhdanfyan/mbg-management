package main

import (
	"testing"
)

func TestParseMoney(t *testing.T) {
	tests := []struct {
		input    string
		expected float64
	}{
		{"Rp 10.000,00", 10000.00},
		{"Rp 1.500.000", 1500000.0},
		{"10.000 per tahun", 10000.0},
		{"  Rp 50.000 \n ", 50000.0},
	}

	for _, tt := range tests {
		result := parseMoney(tt.input)
		if result != tt.expected {
			t.Errorf("parseMoney(%q) = %v; want %v", tt.input, result, tt.expected)
		}
	}
}

func TestParseArea(t *testing.T) {
	tests := []struct {
		input    string
		expected float64
	}{
		{"Lahan : 467 m2", 467.0},
		{"Bangunan : 200 m²", 200.0},
		{" 150m2 ", 150.0},
	}

	for _, tt := range tests {
		result := parseArea(tt.input)
		if result != tt.expected {
			t.Errorf("parseArea(%q) = %v; want %v", tt.input, result, tt.expected)
		}
	}
}
