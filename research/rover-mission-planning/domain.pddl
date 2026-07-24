(define (domain rover-mining)
(:requirements :strips :negative-preconditions)
(:predicates
    ; static — the path network never changes during planning
    (CONNECTED ?from ?to)
    ; static — marks which locations are analysis laboratories
    (LAB ?loc)

    ; fluents
    (at ?rover ?loc)
    (mineral-at ?mineral ?loc)
    (free ?rover)
    (carrying ?rover ?mineral)
    (analyzed ?mineral)
)

(:action move
    :parameters (?rover ?from ?to)
    :precondition
    (and
        (at ?rover ?from)
        (CONNECTED ?from ?to)
    )
    :effect
    (and
        (not (at ?rover ?from))
        (at ?rover ?to)
    )
)

(:action pick-up
    :parameters (?rover ?mineral ?loc)
    :precondition
    (and
        (at ?rover ?loc)
        (mineral-at ?mineral ?loc)
        (free ?rover)
    )
    :effect
    (and
        (carrying ?rover ?mineral)
        (not (mineral-at ?mineral ?loc))
        (not (free ?rover))
    )
)

(:action deliver
    :parameters (?rover ?mineral ?loc)
    :precondition
    (and
        (at ?rover ?loc)
        (carrying ?rover ?mineral)
        (LAB ?loc)
    )
    :effect
    (and
        (analyzed ?mineral)
        (not (carrying ?rover ?mineral))
        (free ?rover)
    )
)

)
