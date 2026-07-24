; Problema base tal como lo describe la actividad:
; un rover en l4 debe recoger dos minerales ya excavados en l1 y l2,
; y llevarlos al laboratorio en l5, respetando las restricciones de
; trayectoria del esquema (Figura 1 de la actividad).
(define (problem rover-mining-p1)
(:domain rover-mining)
(:objects
    l1 l2 l3 l4 l5 - object
    rover1 - object
    mineral1 mineral2 - object
)
(:init
    ; red de trayectorias (dirigida, ver Figura 1)
    (CONNECTED l1 l3) (CONNECTED l3 l1)   ; l1-l3 bidireccional
    (CONNECTED l3 l2)                     ; l3->l2 solo una direccion
    (CONNECTED l2 l4)                     ; l2->l4 solo una direccion
    (CONNECTED l3 l4) (CONNECTED l4 l3)   ; l3-l4 bidireccional
    (CONNECTED l4 l5) (CONNECTED l5 l4)   ; l4-l5 bidireccional

    (LAB l5)

    (at rover1 l4)
    (free rover1)

    (mineral-at mineral1 l1)
    (mineral-at mineral2 l2)
)
(:goal
    (and
        (analyzed mineral1)
        (analyzed mineral2)
    )
)
)
