import networkx as nx


def build_drainage_graph():
    graph = nx.DiGraph()

    graph.add_node(
        "D1",
        name="Drain D1",
        latitude=18.5202,
        longitude=73.8561,
        base_capacity_lps=80,
        blockage_percent=20,
        connected_roads=["road-1"],
    )

    graph.add_node(
        "D2",
        name="Drain D2",
        latitude=18.5194,
        longitude=73.8581,
        base_capacity_lps=60,
        blockage_percent=25,
        connected_roads=["road-2"],
    )

    graph.add_node(
        "D3",
        name="Drain D3",
        latitude=18.5216,
        longitude=73.8550,
        base_capacity_lps=100,
        blockage_percent=5,
        connected_roads=["road-3"],
    )

    graph.add_node(
        "OUTLET",
        name="Main Canal Outlet",
        latitude=18.5224,
        longitude=73.8538,
        base_capacity_lps=250,
        blockage_percent=0,
        connected_roads=[],
    )

    graph.add_edge(
        "D1",
        "D2",
        pipe_id="P1",
        length_m=180,
        diameter_mm=600,
        max_capacity_lps=75,
    )

    graph.add_edge(
        "D2",
        "D3",
        pipe_id="P2",
        length_m=220,
        diameter_mm=500,
        max_capacity_lps=55,
    )

    graph.add_edge(
        "D3",
        "OUTLET",
        pipe_id="P3",
        length_m=260,
        diameter_mm=800,
        max_capacity_lps=120,
    )

    return graph