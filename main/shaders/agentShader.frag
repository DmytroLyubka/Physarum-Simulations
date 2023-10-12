precision mediump float;

uniform float sideLength;
uniform sampler2D tex;

void main() {
    vec2 coord = gl_FragCoord.xy / sideLength;
    vec4 data = texture2D(tex, coord);

    vec3 color;

    if (data.x == 1.0)
    {
        color = vec3(1.0, 1.0, 1.0);
    }
    else
    {
        color = vec3(0.0, 0.0, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
}