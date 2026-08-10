package canonicalizer

import "testing"

func TestCanonicalize(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name, input, want string
		fail              bool
	}{
		{"RFC sample", `{"numbers":[333333333.33333329,1e30,4.50,2e-3,1e-27],"string":"€$\u000f\nA'B\"\\\\\"/","literals":[null,true,false]}`, `{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27],"string":"€$\u000f\nA'B\"\\\\\"/"}`, false},
		{"UTF-16 ordering", `{"€":"Euro","\r":"CR","דּ":"Hebrew","1":"One","😀":"Emoji","":"Control","ö":"Latin"}`, `{"\r":"CR","1":"One","":"Control","ö":"Latin","€":"Euro","😀":"Emoji","דּ":"Hebrew"}`, false},
		{"negative zero", `{"value":-0}`, "", true},
		{"duplicate", `{"a":1,"a":2}`, "", true},
		{"unpaired surrogate", `{"value":"\ud800"}`, "", true},
	}
	for _, test := range tests {
		test := test
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			got, err := Canonicalize([]byte(test.input))
			if test.fail {
				if err == nil {
					t.Fatalf("expected rejection, got %s", got)
				}
				return
			}
			if err != nil {
				t.Fatal(err)
			}
			if string(got) != test.want {
				t.Fatalf("canonical bytes\n got: %s\nwant: %s", got, test.want)
			}
		})
	}
}
