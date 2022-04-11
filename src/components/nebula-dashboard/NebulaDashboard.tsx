import { Container, Paper, Grid, MenuItem, Select, Input, TextField } from '@mui/material';
import useNetwork from 'hooks/useNetwork';
import { useNebula, ClusterList, ClusterState, ClusterInfo } from 'hooks/useNebula';
import { useEffect, useState } from 'react';
import { useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';

export interface Cluster {
    cluster_info: ClusterInfo,
    cluster_addr: string,
}

export function NebulaDashboard() {
    const network = useNetwork();
    const wallet = useConnectedWallet();
    const lcd = useLCDClient();
    const { getClusterList, getClusterState, getClusterInfo, getTarget } = useNebula(network.contracts.nebulaFactory);

    const [clusters, setClusters] = useState<Cluster[]>();
    const [selectedCluster, setSelectedCluster] = useState<Cluster>();
    const [clusterState, setClusterState] = useState<ClusterState>();
    
    useEffect(() => {
        getAllClusters().then()
    }, [wallet, network])

    useEffect(() => {
        if(selectedCluster) {
            getStateForCluster(selectedCluster.cluster_addr).then()
        }
    }, [selectedCluster]) 

    const getAllClusters = async () => {
        getClusterList().then(async data => {
            const clusterPromises: Promise<Cluster>[] = [];
            data.contract_infos.forEach((contract: [active: any, contract_addr: string]) => {
                if(contract[1]) {
                    clusterPromises.push(getInfoForCluster(contract[0]));
                }
            });
            Promise.all(clusterPromises).then(c => {
                setClusters(c);
                setSelectedCluster(c[0]);
            })
        })
    }

    const getInfoForCluster = async (clusterAddress: string): Promise<Cluster> => {
        return {
            cluster_info: await getClusterInfo(clusterAddress),
            cluster_addr: clusterAddress
        }
    }

    const getStateForCluster = async (clusterAddress: string) => {
        getClusterState(clusterAddress).then(data => {
            setClusterState(data);
            console.log(data)
        });
    }

    const onRefresh = () => {
        
    }

    const handleChange = (e: any) => {
        setSelectedCluster(clusters?.find(cluster => cluster.cluster_info.name == e.target.value) as Cluster);
    }

    const addVector = (a: number[], b: number[]) => {
        return a.map((e, i) => e + b[i])
    }

    const subtractVector = (a: number[], b: number[]) => {
        return a.map((e, i) => e - b[i]);
    }

    const sum = (a: number[]) => {
        return a.reduce((m, n) => m + n);
    }

    const absolute = (a: number[]) => {
        return a.map(e => {
            if(e<0) {
                return -e;
            } else{
                return e;
            }
        });
    }

    const elementWiseMultiplication = (a: number[], b: number[]) => {
        return a.map((e, i) => e * b[i]);
    }

    const dotProduct = (a: number[], b: number[]) => {
        return a.map((e, i) => e * b[i]).reduce((i, j) => i + j);
    }

    const divideByScalar = (a: number[], b: number) => {
        return a.map(e => e / b);
    }

    const multiplyByScalar = (a: number[], b: number) => {
        return a.map(e => e * b);
    }

    const capitalAllocation = (i: number[], p: number[]) => {
        return elementWiseMultiplication(i, p);
    }

    const targetCapitalAllocation = (i: number[], w: number[], p: number[]) => {
        return multiplyByScalar(divideByScalar(elementWiseMultiplication(w, p), dotProduct(w, p)), dotProduct(i, p));
    }

    const notionalImbalance = (i: number[], w: number[], p: number[]) => {
        return sum(absolute(subtractVector(targetCapitalAllocation(i, w, p), capitalAllocation(i, p))));
    }

    const separateImbalances = (i: number[], w: number[], p: number[]) => {
        return subtractVector(targetCapitalAllocation(i, w, p), capitalAllocation(i, p));
    }

    return (
        <Container sx={{maxWidth: '1200px', padding: '10px'}}>
            <Select
                value={selectedCluster ? selectedCluster?.cluster_info.name : ""}
                onChange={handleChange}
            >
                {
                    clusters?.map(info => {
                        return (
                            <MenuItem key={info.cluster_info.name} value={info.cluster_info.name}>
                                {info.cluster_info.name}
                            </MenuItem>
                        );
                    })
                }
            </Select>
            {/* <TextField id="filled-basic" label="Filled" variant="filled" /> */}
            <p>{selectedCluster?.cluster_addr}</p>
            <p>{selectedCluster?.cluster_info.name}</p>
            <p>{selectedCluster?.cluster_info.description}</p>
            <p>Target: </p>
            <div>{clusterState?.target.map(target => {
                return (<p key={target.amount}>{target.amount}</p>)
            })}</div>
            <div>Inventory:</div>
            <div>{clusterState?.inv.map(i => {
                return (<p key={i}>{i}</p>)
            })}</div>
            <div>Prices:</div>
            <div>{clusterState?.prices.map(p => {
                return (<p key={p}>{p}</p>)
            })}</div>

            <p>Imbalance: {notionalImbalance(clusterState ? clusterState.inv.map(n => Number(n)) : [0], clusterState ? clusterState?.target.map(target => Number(target.amount)): [0], clusterState ? clusterState?.prices.map(p => Number(p)): [0])}</p>
        </Container>
    );
  }
