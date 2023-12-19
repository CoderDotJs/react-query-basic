import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const SingleQuery = () => {
  const queryClient = useQueryClient();
  const getResponse = () => {
    return new Promise((resolve, reject) => {
      axios
        .get("https://calm-plum-jaguar-tutu.cyclic.app/todos")
        .then((data) => {
          resolve(data);
        })
        .catch((err) => reject(err));
    });
  };
  const postData = () => {
    return new Promise((resolve, reject) => {
      axios
        .post("https://calm-plum-jaguar-tutu.cyclic.app/todos", {
          todoName: "New todo",
          isComplete: false,
        })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => reject(err));
    });
  };
  const deleteData = (id) => {
    return new Promise((resolve, reject) => {
      axios
        .delete("https://calm-plum-jaguar-tutu.cyclic.app/todos/" + id)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => reject(err));
    });
  };
  const updateData = (obj) => {
    return new Promise((resolve, reject) => {
      axios
        .put("https://calm-plum-jaguar-tutu.cyclic.app/todos/" + obj.id, {
          isComplete: obj.isComplete,
        })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => reject(err));
    });
  };
  const {
    data: todos,
    isFetching,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["single-query"],
    queryFn: async () => {
      const res = await getResponse();
      return res.data.data;
    },
    refetchOnWindowFocus: false, //disables refetch on window focus
    retry: 3, //times to retry after failed
    staleTime: 0, //cache time
  });

  //adding data
  const mutateAddData = useMutation({
    mutationFn: async () => {
      const res = await postData();
      return res.data.data;
    },
    onSuccess: (data) => {
      console.log(data);
      alert("Data posted!");
      refetch();
    },
    onError: (error) => {
      console.log(error);
      alert(error?.message);
    },
  });
  //delete data
  const mutateDelete = useMutation({
    mutationFn: async (id) => {
      const res = await deleteData(id);
      return res.data.data;
    },
    onSuccess: (data) => {
      console.log(data);
      alert("Data deleted!");
      refetch();
    },
    onError: (error) => {
      console.log(error);
      alert(error?.message);
    },
  });
  //update todo
  const mutateUpdate = useMutation({
    mutationFn: async (obj) => {
      const res = await updateData(obj);
      return res.data.data;
    },
    onSuccess: (data, variables) => {
      //optimistic update
      queryClient.setQueryData(["single-query"], () => {
        const newArr = todos.map((f) => {
          if (f._id == variables.id) {
            return { ...f, isComplete: variables.isComplete };
          }
          return f;
        });
        return newArr;
      });
    },
    onError: (error) => {
      console.log(error);
      alert(error?.message);
    },
  });
  return (
    <div>
      <div>
        <button onClick={() => refetch()} disabled={isLoading}>
          Refetch
        </button>
        <button
          onClick={() => mutateAddData.mutate()}
          disabled={mutateAddData.isPending}
        >
          Add data
        </button>
        {isFetching && !isError && "Loading..."}
        {isError && !isFetching && JSON.stringify(error)}
        {!isFetching && !isError && (
          <div>
            {todos?.map((todo) => {
              return (
                <div key={todo?._id}>
                  <div>
                    <input
                      type="checkbox"
                      checked={todo?.isComplete}
                      onChange={(e) =>
                        mutateUpdate.mutate({
                          id: todo?._id,
                          isComplete: e.target.checked,
                        })
                      }
                      disabled={mutateUpdate.isPending}
                    />
                    {todo?.todoName}
                    <button
                      onClick={() => mutateDelete.mutate(todo?._id)}
                      disabled={
                        mutateDelete.isPending || mutateUpdate.isPending
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleQuery;
